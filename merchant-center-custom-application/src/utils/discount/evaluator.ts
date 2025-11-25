/**
 * Predicate Evaluator
 *
 * Evaluates commercetools cart discount predicates against cart data.
 * Uses the existing Peggy parser to parse predicates into AST,
 * then walks the AST to determine if the cart qualifies.
 */
import type { Cart, LineItem } from '@commercetools/platform-sdk';
import { parse } from './predicate';
import {
  TNestedRule,
  TConditionStage,
  TConditionCondition,
  TConditionLogical,
  TFunctionTarget,
  isLogicalCondition,
  isConditionCondition,
  isFunctionTarget,
  isFieldTarget,
  isConstantTarget,
} from './types';
import type {
  EvaluationResult,
  EvaluationContext,
  EvaluatePredicateOptions,
  QualificationStatus,
} from './evaluator-types';
import {
  getFieldValue,
  compareValues,
  parseMoneyValue,
  formatQualificationMessage,
  calculateLineItemsTotal,
  countLineItemsQuantity,
} from './evaluator-helpers';

/**
 * Evaluate a predicate string against a cart
 *
 * @param predicateString - The cart predicate string to evaluate
 * @param cart - The cart to evaluate against
 * @param options - Optional configuration including category resolver
 * @returns Evaluation result with qualification status and message
 */
export async function evaluatePredicate(
  predicateString: string,
  cart: Cart,
  options?: EvaluatePredicateOptions
): Promise<EvaluationResult> {
  try {
    // Parse the predicate string to AST
    const ast = parse(predicateString);

    // Handle empty predicates
    if ('isEmpty' in ast && ast.isEmpty) {
      return {
        isApplicable: true,
        type: 'EMPTY',
        qualificationStatus: 'QUALIFIED',
        qualificationMessage: 'No predicate specified',
      };
    }

    // Create evaluation context
    const ctx: EvaluationContext = {
      cart,
      categoryResolver: options?.categoryResolver,
      currencyCode: cart.totalPrice?.currencyCode || 'USD',
    };

    // Evaluate the AST
    const result = await evaluateNode(ast as TNestedRule, ctx);

    return result;
  } catch (error) {
    console.error('Error evaluating predicate:', error);
    return {
      isApplicable: false,
      type: 'PARSE_ERROR',
      qualificationStatus: 'UNKNOWN',
      qualificationMessage: `Failed to parse predicate: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Evaluate an AST node
 */
async function evaluateNode(
  node: TNestedRule,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  if (isLogicalCondition<TConditionStage.Nested>(node)) {
    return evaluateLogical(node, ctx);
  }

  if (isConditionCondition<TConditionStage.Nested>(node)) {
    return evaluateCondition(node, ctx);
  }

  // Unknown node type
  return {
    isApplicable: false,
    type: 'UNKNOWN',
    qualificationStatus: 'UNKNOWN',
    qualificationMessage: 'Unable to evaluate predicate node',
  };
}

/**
 * Evaluate a logical condition (and/or with optional negation)
 */
async function evaluateLogical(
  node: TConditionLogical<TConditionStage.Nested>,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const conditions = node.conditions as TNestedRule[];
  const results: EvaluationResult[] = [];

  // Evaluate all conditions
  for (const condition of conditions) {
    const result = await evaluateNode(condition, ctx);
    results.push(result);
  }

  let isApplicable: boolean;
  let qualificationStatus: QualificationStatus;

  if (node.logical === 'and') {
    // All conditions must be satisfied
    isApplicable = results.every((r) => r.isApplicable);

    // Check for NOT_APPLICABLE conditions
    const hasNotApplicable = results.some(
      (r) => r.qualificationStatus === 'NOT_APPLICABLE'
    );
    if (hasNotApplicable) {
      qualificationStatus = 'NOT_APPLICABLE';
    } else if (isApplicable) {
      qualificationStatus = 'QUALIFIED';
    } else {
      qualificationStatus = 'PENDING';
    }
  } else {
    // OR: At least one condition must be satisfied
    isApplicable = results.some((r) => r.isApplicable);

    if (isApplicable) {
      qualificationStatus = 'QUALIFIED';
    } else if (
      results.every((r) => r.qualificationStatus === 'NOT_APPLICABLE')
    ) {
      qualificationStatus = 'NOT_APPLICABLE';
    } else {
      qualificationStatus = 'PENDING';
    }
  }

  // Apply negation if present
  if (node.isNegated) {
    isApplicable = !isApplicable;
    if (qualificationStatus === 'QUALIFIED') {
      qualificationStatus = 'NOT_APPLICABLE';
    } else if (qualificationStatus === 'NOT_APPLICABLE') {
      qualificationStatus = 'QUALIFIED';
    }
  }

  // Collect qualified and pending conditions
  const qualifiedConditions = results
    .filter((r) => r.isApplicable)
    .map((r) => formatConditionSummary(r))
    .filter((msg): msg is string => msg !== undefined);

  const pendingConditions = results
    .filter((r) => !r.isApplicable && r.qualificationStatus === 'PENDING')
    .map((r) => r.qualificationMessage)
    .filter((msg): msg is string => msg !== undefined);

  return {
    isApplicable,
    type: 'COMBINED',
    qualificationStatus,
    qualificationMessage:
      pendingConditions.length > 0
        ? `Requirements needed: ${pendingConditions.join(' and ')}`
        : undefined,
    qualifiedConditions,
    pendingConditions,
    conditions: results,
  };
}

/**
 * Evaluate a single condition
 */
async function evaluateCondition(
  node: TConditionCondition<TConditionStage.Nested>,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const target = node.target;

  // Handle function targets (lineItemExists, lineItemCount, etc.)
  if (target && isFunctionTarget<TConditionStage.Nested>(target)) {
    return evaluateFunction(target, node.operator, node.value, ctx);
  }

  // Handle field targets (shippingAddress.country, totalPrice, etc.)
  if (target && isFieldTarget<TConditionStage.Nested>(target)) {
    return evaluateFieldCondition(target.name, node.operator, node.value, ctx);
  }

  // Handle constant targets (true = true, etc.)
  if (target && isConstantTarget<TConditionStage.Nested>(target)) {
    const targetValue = target.value?.value;
    const result = compareValues(targetValue, node.operator, node.value);
    return {
      isApplicable: result,
      type: 'CONSTANT',
      qualificationStatus: result ? 'QUALIFIED' : 'NOT_APPLICABLE',
    };
  }

  return {
    isApplicable: false,
    type: 'UNKNOWN',
    qualificationStatus: 'UNKNOWN',
    qualificationMessage: 'Unable to evaluate condition',
  };
}

/**
 * Evaluate a field-based condition
 */
async function evaluateFieldCondition(
  fieldPath: string,
  operator: string | undefined,
  expectedValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  // Special handling for customer group conditions
  if (
    fieldPath.includes('customer.customerGroup') ||
    fieldPath.includes('customerGroup')
  ) {
    return {
      isApplicable: false,
      type: 'CUSTOMER_GROUP',
      qualificationStatus: 'NOT_APPLICABLE',
      qualificationMessage: 'Customer group specific discount',
    };
  }

  // Special handling for totalPrice
  if (fieldPath === 'totalPrice') {
    return evaluateTotalPriceCondition(operator, expectedValue, ctx);
  }

  const actualValue = getFieldValue(fieldPath, ctx);
  const result = compareValues(actualValue, operator, expectedValue);

  return {
    isApplicable: result,
    type: 'FIELD',
    qualificationStatus: result ? 'QUALIFIED' : 'PENDING',
    qualificationMessage: result
      ? undefined
      : `Field ${fieldPath} does not match required value`,
  };
}

/**
 * Evaluate a totalPrice condition
 */
function evaluateTotalPriceCondition(
  operator: string | undefined,
  expectedValue: unknown,
  ctx: EvaluationContext
): EvaluationResult {
  const cartTotal = ctx.cart.totalPrice;
  if (!cartTotal) {
    return {
      isApplicable: false,
      type: 'TOTAL_PRICE',
      qualificationStatus: 'PENDING',
      qualificationMessage: 'Cart has no total price',
    };
  }

  // Parse expected money value
  const parsedExpected =
    typeof expectedValue === 'string' ? parseMoneyValue(expectedValue) : null;

  if (!parsedExpected) {
    return {
      isApplicable: false,
      type: 'TOTAL_PRICE',
      qualificationStatus: 'UNKNOWN',
      qualificationMessage: 'Could not parse required price value',
    };
  }

  const currentAmount = cartTotal.centAmount;
  const requiredAmount = parsedExpected.centAmount;
  const result = compareValues(cartTotal, operator, expectedValue);

  if (result) {
    return {
      isApplicable: true,
      type: 'TOTAL_PRICE',
      qualificationStatus: 'QUALIFIED',
      currentAmount: currentAmount / 100,
      requiredAmount: requiredAmount / 100,
    };
  }

  const remainingAmount = (requiredAmount - currentAmount) / 100;
  return {
    isApplicable: false,
    type: 'TOTAL_PRICE',
    qualificationStatus: 'PENDING',
    qualificationMessage: formatQualificationMessage('TOTAL_PRICE', {
      remainingAmount,
      currencyCode: cartTotal.currencyCode,
    }),
    currentAmount: currentAmount / 100,
    requiredAmount: requiredAmount / 100,
    remainingAmount,
  };
}

/**
 * Evaluate a function-based condition
 */
async function evaluateFunction(
  target: TFunctionTarget<TConditionStage.Nested>,
  operator: string | undefined,
  compareValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const functionName = target.name;
  const args = target.args as TNestedRule[] | undefined;

  if (!args || args.length === 0) {
    return {
      isApplicable: false,
      type: 'FUNCTION',
      qualificationStatus: 'UNKNOWN',
      qualificationMessage: `Function ${functionName} has no arguments`,
    };
  }

  const innerPredicate = args[0];

  switch (functionName) {
    case 'lineItemExists':
      return evaluateLineItemExists(
        innerPredicate,
        operator,
        compareValue,
        ctx
      );

    case 'lineItemCount':
      return evaluateLineItemCount(innerPredicate, operator, compareValue, ctx);

    case 'lineItemTotal':
    case 'lineItemGrossTotal':
      return evaluateLineItemGrossTotal(
        innerPredicate,
        operator,
        compareValue,
        ctx
      );

    case 'lineItemNetTotal':
      return evaluateLineItemNetTotal(
        innerPredicate,
        operator,
        compareValue,
        ctx
      );

    case 'forAllLineItems':
      return evaluateForAllLineItems(innerPredicate, ctx);

    case 'customLineItemExists':
    case 'customLineItemCount':
    case 'customLineItemTotal':
    case 'customLineItemGrossTotal':
    case 'customLineItemNetTotal':
      // Custom line items not fully implemented yet
      return {
        isApplicable: false,
        type: 'CUSTOM_LINE_ITEM_FUNCTION',
        qualificationStatus: 'UNKNOWN',
        qualificationMessage: `Custom line item functions not fully supported`,
      };

    default:
      return {
        isApplicable: false,
        type: 'UNKNOWN_FUNCTION',
        qualificationStatus: 'UNKNOWN',
        qualificationMessage: `Unknown function: ${functionName}`,
      };
  }
}

/**
 * Evaluate lineItemExists function
 * Returns true if ANY line item matches the inner predicate
 */
async function evaluateLineItemExists(
  innerPredicate: TNestedRule,
  operator: string | undefined,
  compareValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const lineItems = ctx.cart.lineItems || [];

  for (const lineItem of lineItems) {
    const lineItemCtx: EvaluationContext = {
      ...ctx,
      currentLineItem: lineItem,
    };

    const result = await evaluateNode(innerPredicate, lineItemCtx);
    if (result.isApplicable) {
      // Found a matching line item
      const expectedMatch = compareValue === true || compareValue === 'true';
      const matches = operator === '=' ? expectedMatch : !expectedMatch;

      if (matches) {
        return {
          isApplicable: true,
          type: 'LINE_ITEM_EXISTS',
          qualificationStatus: 'QUALIFIED',
          qualificationMessage: 'Required product found in cart',
        };
      }
    }
  }

  // No matching line item found
  const expectedMatch = compareValue === true || compareValue === 'true';
  const matches = operator === '=' ? !expectedMatch : expectedMatch;

  if (matches) {
    return {
      isApplicable: true,
      type: 'LINE_ITEM_EXISTS',
      qualificationStatus: 'QUALIFIED',
    };
  }

  return {
    isApplicable: false,
    type: 'LINE_ITEM_EXISTS',
    qualificationStatus: 'PENDING',
    qualificationMessage: formatQualificationMessage('LINE_ITEM_EXISTS', {}),
  };
}

/**
 * Evaluate lineItemCount function
 * Counts line items matching the inner predicate
 */
async function evaluateLineItemCount(
  innerPredicate: TNestedRule,
  operator: string | undefined,
  compareValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const lineItems = ctx.cart.lineItems || [];
  const matchingItems: LineItem[] = [];

  for (const lineItem of lineItems) {
    const lineItemCtx: EvaluationContext = {
      ...ctx,
      currentLineItem: lineItem,
    };

    const result = await evaluateNode(innerPredicate, lineItemCtx);
    if (result.isApplicable) {
      matchingItems.push(lineItem);
    }
  }

  const currentCount = countLineItemsQuantity(matchingItems);
  const requiredCount =
    typeof compareValue === 'number'
      ? compareValue
      : parseInt(String(compareValue), 10) || 0;

  const result = compareValues(currentCount, operator, requiredCount);

  // Try to get category or product name for message
  let categoryName: string | undefined;
  let productName: string | undefined;

  // Extract info from the inner predicate if possible
  const predicateInfo = extractPredicateInfo(innerPredicate, ctx);
  categoryName = predicateInfo.categoryName;
  productName = predicateInfo.productName;

  const predicateType = predicateInfo.isSku ? 'SKU_COUNT' : 'CATEGORY_COUNT';

  if (result) {
    return {
      isApplicable: true,
      type: predicateType,
      qualificationStatus: 'QUALIFIED',
      currentCount,
      requiredCount,
      categoryName,
      productName,
    };
  }

  const remainingCount = requiredCount - currentCount;
  return {
    isApplicable: false,
    type: predicateType,
    qualificationStatus: 'PENDING',
    qualificationMessage: formatQualificationMessage(predicateType, {
      remainingCount,
      categoryName,
      productName,
    }),
    currentCount,
    requiredCount,
    remainingCount,
    categoryName,
    productName,
  };
}

/**
 * Evaluate lineItemGrossTotal function
 * Sums gross totals of matching line items
 */
async function evaluateLineItemGrossTotal(
  innerPredicate: TNestedRule,
  operator: string | undefined,
  compareValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const lineItems = ctx.cart.lineItems || [];
  const matchingItems: LineItem[] = [];

  for (const lineItem of lineItems) {
    const lineItemCtx: EvaluationContext = {
      ...ctx,
      currentLineItem: lineItem,
    };

    const result = await evaluateNode(innerPredicate, lineItemCtx);
    if (result.isApplicable) {
      matchingItems.push(lineItem);
    }
  }

  const currentTotal = calculateLineItemsTotal(matchingItems, 'gross');
  const parsedExpected =
    typeof compareValue === 'string' ? parseMoneyValue(compareValue) : null;
  const requiredTotal = parsedExpected?.centAmount ?? 0;

  const result = compareValues(currentTotal, operator, requiredTotal);

  // Try to get category info
  const predicateInfo = extractPredicateInfo(innerPredicate, ctx);
  const categoryName = predicateInfo.categoryName;
  const categoryNames = predicateInfo.categoryNames;
  const categoryIds = predicateInfo.categoryIds;

  if (result) {
    return {
      isApplicable: true,
      type: 'CATEGORY_GROSS_TOTAL',
      qualificationStatus: 'QUALIFIED',
      currentAmount: currentTotal / 100,
      requiredAmount: requiredTotal / 100,
      categoryName,
      categoryNames,
      categoryIds,
    };
  }

  const remainingAmount = (requiredTotal - currentTotal) / 100;
  return {
    isApplicable: false,
    type: 'CATEGORY_GROSS_TOTAL',
    qualificationStatus: 'PENDING',
    qualificationMessage: formatQualificationMessage('CATEGORY_GROSS_TOTAL', {
      remainingAmount,
      currencyCode: ctx.currencyCode,
      categoryName: categoryNames || categoryName,
    }),
    currentAmount: currentTotal / 100,
    requiredAmount: requiredTotal / 100,
    remainingAmount,
    categoryName,
    categoryNames,
    categoryIds,
  };
}

/**
 * Evaluate lineItemNetTotal function
 * Sums net totals of matching line items
 */
async function evaluateLineItemNetTotal(
  innerPredicate: TNestedRule,
  operator: string | undefined,
  compareValue: unknown,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const lineItems = ctx.cart.lineItems || [];
  const matchingItems: LineItem[] = [];

  for (const lineItem of lineItems) {
    const lineItemCtx: EvaluationContext = {
      ...ctx,
      currentLineItem: lineItem,
    };

    const result = await evaluateNode(innerPredicate, lineItemCtx);
    if (result.isApplicable) {
      matchingItems.push(lineItem);
    }
  }

  const currentTotal = calculateLineItemsTotal(matchingItems, 'net');
  const parsedExpected =
    typeof compareValue === 'string' ? parseMoneyValue(compareValue) : null;
  const requiredTotal = parsedExpected?.centAmount ?? 0;

  const result = compareValues(currentTotal, operator, requiredTotal);

  if (result) {
    return {
      isApplicable: true,
      type: 'CATEGORY_NET_TOTAL',
      qualificationStatus: 'QUALIFIED',
      currentAmount: currentTotal / 100,
      requiredAmount: requiredTotal / 100,
    };
  }

  const remainingAmount = (requiredTotal - currentTotal) / 100;
  return {
    isApplicable: false,
    type: 'CATEGORY_NET_TOTAL',
    qualificationStatus: 'PENDING',
    qualificationMessage: `Spend ${
      ctx.currencyCode || 'USD'
    } ${remainingAmount.toFixed(2)} more to qualify`,
    currentAmount: currentTotal / 100,
    requiredAmount: requiredTotal / 100,
    remainingAmount,
  };
}

/**
 * Evaluate forAllLineItems function
 * Returns true if ALL line items match the inner predicate
 */
async function evaluateForAllLineItems(
  innerPredicate: TNestedRule,
  ctx: EvaluationContext
): Promise<EvaluationResult> {
  const lineItems = ctx.cart.lineItems || [];

  if (lineItems.length === 0) {
    return {
      isApplicable: false,
      type: 'FOR_ALL_LINE_ITEMS',
      qualificationStatus: 'PENDING',
      qualificationMessage: 'Cart has no line items',
    };
  }

  for (const lineItem of lineItems) {
    const lineItemCtx: EvaluationContext = {
      ...ctx,
      currentLineItem: lineItem,
    };

    const result = await evaluateNode(innerPredicate, lineItemCtx);
    if (!result.isApplicable) {
      return {
        isApplicable: false,
        type: 'FOR_ALL_LINE_ITEMS',
        qualificationStatus: 'PENDING',
        qualificationMessage: 'Not all line items match the required condition',
      };
    }
  }

  return {
    isApplicable: true,
    type: 'FOR_ALL_LINE_ITEMS',
    qualificationStatus: 'QUALIFIED',
  };
}

/**
 * Extract useful information from a predicate for display purposes
 */
function extractPredicateInfo(
  predicate: TNestedRule,
  ctx: EvaluationContext
): {
  categoryName?: string;
  categoryNames?: string;
  categoryIds?: string[];
  productName?: string;
  isSku?: boolean;
} {
  const info: {
    categoryName?: string;
    categoryNames?: string;
    categoryIds?: string[];
    productName?: string;
    isSku?: boolean;
  } = {};

  // Handle condition nodes
  if (isConditionCondition<TConditionStage.Nested>(predicate)) {
    const target = predicate.target;

    if (target && isFieldTarget<TConditionStage.Nested>(target)) {
      const fieldName = target.name;

      // Check for category conditions
      if (fieldName === 'categories.id') {
        const value = predicate.value;
        if (Array.isArray(value)) {
          info.categoryIds = value as string[];
          // Try to resolve category names
          if (ctx.categoryResolver) {
            const names: string[] = [];
            for (const id of value) {
              const name = ctx.categoryResolver(id as string);
              if (name && typeof name === 'string') {
                names.push(name);
              }
            }
            if (names.length > 0) {
              info.categoryNames = names.join(' or ');
              info.categoryName = names[0];
            }
          }
        } else if (typeof value === 'string') {
          info.categoryIds = [value];
          if (ctx.categoryResolver) {
            const name = ctx.categoryResolver(value);
            if (name && typeof name === 'string') {
              info.categoryName = name;
            }
          }
        }
      }

      // Check for SKU conditions
      if (fieldName === 'sku') {
        info.isSku = true;
        const skuValue = predicate.value;
        if (typeof skuValue === 'string') {
          // Try to find product name from cart
          const lineItem = ctx.cart.lineItems?.find(
            (li) => li.variant?.sku === skuValue
          );
          if (lineItem) {
            info.productName =
              (lineItem.name as Record<string, string>)?.['en'] ||
              (lineItem.name as Record<string, string>)?.['en-US'] ||
              `SKU: ${skuValue}`;
          } else {
            info.productName = `SKU: ${skuValue}`;
          }
        }
      }
    }
  }

  // Handle logical nodes - recurse into conditions
  if (isLogicalCondition<TConditionStage.Nested>(predicate)) {
    const conditions = predicate.conditions as TNestedRule[];
    for (const condition of conditions) {
      const subInfo = extractPredicateInfo(condition, ctx);
      if (subInfo.categoryName) info.categoryName = subInfo.categoryName;
      if (subInfo.categoryNames) info.categoryNames = subInfo.categoryNames;
      if (subInfo.categoryIds) info.categoryIds = subInfo.categoryIds;
      if (subInfo.productName) info.productName = subInfo.productName;
      if (subInfo.isSku) info.isSku = subInfo.isSku;
    }
  }

  return info;
}

/**
 * Format a summary message for a qualified condition
 */
function formatConditionSummary(result: EvaluationResult): string | undefined {
  switch (result.type) {
    case 'CATEGORY_GROSS_TOTAL':
      if (
        result.currentAmount !== undefined &&
        result.requiredAmount !== undefined
      ) {
        const categoryLabel =
          result.categoryNames || result.categoryName || 'category';
        return `Spent ${result.currentAmount.toFixed(
          2
        )} on ${categoryLabel} products (required: ${result.requiredAmount.toFixed(
          2
        )})`;
      }
      break;

    case 'CATEGORY_COUNT':
      if (
        result.currentCount !== undefined &&
        result.requiredCount !== undefined
      ) {
        return `Added ${result.currentCount} items from ${
          result.categoryName || 'category'
        } (required: ${result.requiredCount})`;
      }
      break;

    case 'SKU_COUNT':
      if (
        result.currentCount !== undefined &&
        result.requiredCount !== undefined
      ) {
        return `Added ${result.currentCount} units of ${
          result.productName || 'product'
        } (required: ${result.requiredCount})`;
      }
      break;

    case 'TOTAL_PRICE':
      return 'Cart total meets the minimum amount requirement';

    case 'CATEGORY_EXISTS':
      return `Added items from ${result.categoryName || 'required'} category`;

    case 'LINE_ITEM_EXISTS':
      return result.productName
        ? `Added ${result.productName} to cart`
        : 'Required product added to cart';
  }

  return 'Condition met';
}

export { parse } from './predicate';
export type {
  EvaluationResult,
  EvaluationContext,
  EvaluatePredicateOptions,
  QualificationStatus,
} from './evaluator-types';
