/**
 * Discount utilities module
 *
 * Exports predicate parsing and evaluation functionality for commercetools cart discounts.
 */

// Predicate parser
export {
  parse,
  stringify,
  escapeUnsupportedChars,
  isPartialDefaultPredicate,
} from './predicate';

// Evaluator
export { evaluatePredicate } from './evaluator';

// Types from evaluator
export type {
  EvaluationResult,
  EvaluationContext,
  EvaluatePredicateOptions,
  QualificationStatus,
  CategoryResolver,
  ParsedMoney,
} from './evaluator-types';

// Types from parser
export type {
  TNestedRule,
  TNestedRuleWithIds,
  TNormalizedRule,
  TConditionCondition,
  TConditionLogical,
  TParsedRawCondition,
  TParsedRawLogical,
  TFunctionTarget,
  TConstantTarget,
  TFunctionName,
  TAst,
} from './types';

export {
  TConditionStage,
  TConditionKind,
  isLogicalCondition,
  isConditionCondition,
  isFunctionTarget,
  isConstantTarget,
  isFieldTarget,
} from './types';

// Constants
export {
  DiscountPredicateTargetTypes,
  lineItemFunctions,
  customLineItemFunctions,
  RootLogical,
} from './constants';

// Helpers (useful for external use)
export {
  getFieldValue,
  compareValues,
  parseMoneyValue,
  formatQualificationMessage,
  getPredicateTypeDisplayName,
  calculateLineItemsTotal,
  countLineItemsQuantity,
} from './evaluator-helpers';
