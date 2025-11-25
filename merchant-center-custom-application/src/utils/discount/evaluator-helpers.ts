/**
 * Helper utilities for the predicate evaluator
 */
import type { Cart, LineItem } from '@commercetools/platform-sdk';
import type { EvaluationContext, ParsedMoney } from './evaluator-types';

/**
 * Navigate a dot-separated field path and get the value
 * Handles special cases like categories.id which returns an array
 *
 * @param fieldPath - Dot-separated path like "shippingAddress.country" or "categories.id"
 * @param ctx - Evaluation context with cart and optional line item
 * @returns The value at the field path, or undefined if not found
 */
export function getFieldValue(
  fieldPath: string,
  ctx: EvaluationContext
): unknown {
  // Handle backtick-escaped field names (e.g., `field-with-dashes`)
  const normalizedPath = fieldPath.replace(/`([^`]+)`/g, '$1');
  const parts = normalizedPath.split('.');

  // Determine the source object based on context and field path
  let source: unknown;

  // Check if we're in a line item context and the field starts with a line item property
  const lineItemFields = [
    'sku',
    'productId',
    'productKey',
    'variant',
    'name',
    'quantity',
    'price',
    'totalPrice',
    'custom',
    'categories',
  ];
  const firstPart = parts[0];

  if (ctx.currentLineItem && lineItemFields.includes(firstPart)) {
    source = ctx.currentLineItem;

    // Special handling for 'sku' which is on the variant
    if (firstPart === 'sku') {
      return ctx.currentLineItem.variant?.sku;
    }

    // Special handling for 'categories.id' - get category IDs from the product
    if (normalizedPath === 'categories.id') {
      // Categories are on the product, accessed via variant
      // In commercetools, categories are typically in product.categories
      // The line item has productId, and we need to check variant.attributes or similar
      // For now, we'll check if there's a categories array on the line item or variant
      const lineItem = ctx.currentLineItem as LineItem & {
        categories?: Array<{ id: string }>;
      };
      const variant = lineItem.variant as
        | (typeof lineItem.variant & { categories?: Array<{ id: string }> })
        | undefined;

      // Try multiple sources for categories
      if (Array.isArray(lineItem.categories)) {
        return lineItem.categories.map((c) => c.id);
      }
      if (variant && Array.isArray(variant.categories)) {
        return variant.categories.map((c) => c.id);
      }
      // Categories might be stored in custom fields or we may need to fetch them
      return [];
    }
  } else {
    source = ctx.cart;

    // Handle cart-level special fields
    if (normalizedPath === 'customer.customerGroup.key') {
      return (ctx.cart.customerGroup as { key?: string } | undefined)?.key;
    }

    if (normalizedPath === 'customer.customerGroup.id') {
      return ctx.cart.customerGroup?.id;
    }

    // Handle totalPrice specially - it's a Money object
    if (firstPart === 'totalPrice' && parts.length === 1) {
      return ctx.cart.totalPrice;
    }
  }

  // Navigate the path
  let value: unknown = source;
  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'object') {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Parse a money string like "500.00 USD" into its components
 *
 * @param moneyString - Money value in format "amount currency" (e.g., "500.00 USD")
 * @returns Parsed money object with centAmount, currencyCode, and amount
 */
export function parseMoneyValue(moneyString: string): ParsedMoney | null {
  // Match pattern: optional decimal number followed by space and 3-letter currency code
  const match = moneyString.match(/^([\d.]+)\s+([A-Z]{3})$/);
  if (!match) {
    // Try parsing as just a number
    const numericValue = parseFloat(moneyString);
    if (!isNaN(numericValue)) {
      return {
        amount: numericValue,
        centAmount: Math.round(numericValue * 100),
        currencyCode: 'USD', // Default currency
      };
    }
    return null;
  }

  const amount = parseFloat(match[1]);
  const currencyCode = match[2];

  return {
    amount,
    centAmount: Math.round(amount * 100),
    currencyCode,
  };
}

/**
 * Compare two values using the specified operator
 *
 * @param actual - The actual value from the cart/line item
 * @param operator - The comparison operator
 * @param expected - The expected value from the predicate
 * @returns Whether the comparison is true
 */
export function compareValues(
  actual: unknown,
  operator: string | undefined,
  expected: unknown
): boolean {
  if (operator === undefined) {
    return actual === expected;
  }

  switch (operator) {
    case '=':
      return compareEquality(actual, expected);

    case '!=':
    case '<>':
      return !compareEquality(actual, expected);

    case '>':
      return compareNumeric(actual, expected) > 0;

    case '>=':
      return compareNumeric(actual, expected) >= 0;

    case '<':
      return compareNumeric(actual, expected) < 0;

    case '<=':
      return compareNumeric(actual, expected) <= 0;

    case 'contains':
      return evaluateContains(actual, expected);

    case 'contains any':
      return evaluateContainsAny(actual, expected);

    case 'contains all':
      return evaluateContainsAll(actual, expected);

    case 'in':
      return evaluateIn(actual, expected);

    case 'not in':
      return !evaluateIn(actual, expected);

    case 'is defined':
      return actual !== undefined && actual !== null;

    case 'is not defined':
      return actual === undefined || actual === null;

    case 'is empty':
      return Array.isArray(actual) && actual.length === 0;

    case 'is not empty':
      return Array.isArray(actual) && actual.length > 0;

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Compare two values for equality
 */
function compareEquality(actual: unknown, expected: unknown): boolean {
  // Handle Money comparison
  if (isMoneyObject(actual) && typeof expected === 'string') {
    const parsedExpected = parseMoneyValue(expected);
    if (parsedExpected) {
      return (
        actual.centAmount === parsedExpected.centAmount &&
        actual.currencyCode === parsedExpected.currencyCode
      );
    }
  }

  // Handle array equality (for sets)
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    return expected.every((e) => actual.includes(e));
  }

  return actual === expected;
}

/**
 * Compare two values numerically
 * Returns negative if actual < expected, 0 if equal, positive if actual > expected
 */
function compareNumeric(actual: unknown, expected: unknown): number {
  let actualNum: number;
  let expectedNum: number;

  // Handle Money objects
  if (isMoneyObject(actual)) {
    actualNum = actual.centAmount;
    if (typeof expected === 'string') {
      const parsed = parseMoneyValue(expected);
      expectedNum = parsed?.centAmount ?? 0;
    } else if (typeof expected === 'number') {
      expectedNum = expected * 100; // Assume it's in main currency units
    } else {
      expectedNum = 0;
    }
  } else if (typeof actual === 'number') {
    actualNum = actual;
    expectedNum =
      typeof expected === 'number'
        ? expected
        : parseFloat(String(expected)) || 0;
  } else {
    actualNum = parseFloat(String(actual)) || 0;
    expectedNum =
      typeof expected === 'number'
        ? expected
        : parseFloat(String(expected)) || 0;
  }

  return actualNum - expectedNum;
}

/**
 * Check if actual array contains expected value
 */
function evaluateContains(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(actual)) {
    return actual.includes(expected);
  }
  if (typeof actual === 'string' && typeof expected === 'string') {
    return actual.includes(expected);
  }
  return false;
}

/**
 * Check if actual array contains any of expected values
 */
function evaluateContainsAny(actual: unknown, expected: unknown): boolean {
  if (!Array.isArray(actual)) return false;

  if (Array.isArray(expected)) {
    return expected.some((e) => actual.includes(e));
  }
  return actual.includes(expected);
}

/**
 * Check if actual array contains all of expected values
 */
function evaluateContainsAll(actual: unknown, expected: unknown): boolean {
  if (!Array.isArray(actual)) return false;

  if (Array.isArray(expected)) {
    return expected.every((e) => actual.includes(e));
  }
  return actual.includes(expected);
}

/**
 * Check if actual value is in expected array
 */
function evaluateIn(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }
  return actual === expected;
}

/**
 * Type guard for Money objects
 */
function isMoneyObject(
  value: unknown
): value is { centAmount: number; currencyCode: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'centAmount' in value &&
    'currencyCode' in value
  );
}

/**
 * Format a qualification message for pending conditions
 *
 * @param type - The predicate type
 * @param context - Additional context for the message
 * @returns Human-readable message
 */
export function formatQualificationMessage(
  type: string,
  context: {
    remainingAmount?: number;
    remainingCount?: number;
    currencyCode?: string;
    categoryName?: string;
    productName?: string;
  }
): string {
  const {
    remainingAmount,
    remainingCount,
    currencyCode,
    categoryName,
    productName,
  } = context;
  const currency = currencyCode || 'USD';

  switch (type) {
    case 'TOTAL_PRICE':
      if (remainingAmount !== undefined) {
        return `Spend ${currency} ${remainingAmount.toFixed(
          2
        )} more to qualify`;
      }
      break;

    case 'CATEGORY_GROSS_TOTAL':
      if (remainingAmount !== undefined && categoryName) {
        return `Spend ${currency} ${remainingAmount.toFixed(
          2
        )} more on ${categoryName} products to qualify`;
      }
      break;

    case 'CATEGORY_COUNT':
      if (remainingCount !== undefined && categoryName) {
        const items = remainingCount === 1 ? 'item' : 'items';
        return `Add ${remainingCount} more ${items} from ${categoryName} to qualify`;
      }
      break;

    case 'CATEGORY_EXISTS':
      if (categoryName) {
        return `Add any item from ${categoryName} category to qualify`;
      }
      break;

    case 'SKU_COUNT':
      if (remainingCount !== undefined && productName) {
        const units = remainingCount === 1 ? 'unit' : 'units';
        return `Add ${remainingCount} more ${units} of ${productName} to qualify`;
      }
      break;

    case 'LINE_ITEM_EXISTS':
      return 'Add required product to cart to qualify';

    case 'CUSTOMER_GROUP':
      return 'Customer group specific discount';

    default:
      if (remainingAmount !== undefined) {
        return `Spend ${currency} ${remainingAmount.toFixed(
          2
        )} more to qualify`;
      }
      if (remainingCount !== undefined) {
        return `Add ${remainingCount} more items to qualify`;
      }
  }

  return 'Unable to determine qualification requirements';
}

/**
 * Get a display name for a predicate type
 */
export function getPredicateTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    TOTAL_PRICE: 'Cart Total',
    CATEGORY_GROSS_TOTAL: 'Category Spending',
    CATEGORY_COUNT: 'Category Item Count',
    CATEGORY_EXISTS: 'Category Product',
    SKU_COUNT: 'Specific Product Count',
    LINE_ITEM_EXISTS: 'Product in Cart',
    CUSTOMER_GROUP: 'Customer Group',
    COMBINED: 'Multiple Conditions',
    UNKNOWN: 'Unknown Condition',
  };

  return displayNames[type] || type;
}

/**
 * Calculate cart totals for specific line items
 */
export function calculateLineItemsTotal(
  lineItems: LineItem[],
  type: 'gross' | 'net' | 'total' = 'total'
): number {
  return lineItems.reduce((sum, item) => {
    if (type === 'gross' && item.taxedPrice?.totalGross) {
      return sum + item.taxedPrice.totalGross.centAmount;
    }
    if (type === 'net' && item.taxedPrice?.totalNet) {
      return sum + item.taxedPrice.totalNet.centAmount;
    }
    // Default to totalPrice
    return sum + (item.totalPrice?.centAmount ?? 0);
  }, 0);
}

/**
 * Count total quantity across line items
 */
export function countLineItemsQuantity(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}
