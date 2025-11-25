/**
 * Types for the predicate evaluator module
 */
import type { Cart, LineItem } from '@commercetools/platform-sdk';

/**
 * Qualification status for a predicate evaluation
 */
export type QualificationStatus =
  | 'QUALIFIED' // All requirements met, discount applicable
  | 'PENDING' // Requirements not met yet, but achievable
  | 'NOT_APPLICABLE' // Cannot be met (wrong customer group, missing data, etc.)
  | 'UNKNOWN'; // Predicate pattern not recognized or evaluation failed

/**
 * Result of evaluating a predicate against a cart
 */
export interface EvaluationResult {
  /** Whether the cart qualifies for the discount */
  isApplicable: boolean;

  /** Type identifier for the predicate */
  type: string;

  /** Detailed qualification status */
  qualificationStatus: QualificationStatus;

  /** Human-readable qualification message */
  qualificationMessage?: string;

  // Progress tracking for amount-based conditions
  /** Current amount in main currency units (e.g., dollars) */
  currentAmount?: number;
  /** Required amount in main currency units */
  requiredAmount?: number;
  /** Remaining amount needed to qualify */
  remainingAmount?: number;

  // Progress tracking for count-based conditions
  /** Current count of matching items */
  currentCount?: number;
  /** Required count of items */
  requiredCount?: number;
  /** Remaining count needed to qualify */
  remainingCount?: number;

  // For category-based predicates
  /** Single category name */
  categoryName?: string;
  /** Multiple category names (comma-separated or joined) */
  categoryNames?: string;
  /** Category IDs involved in the condition */
  categoryIds?: string[];

  // For SKU-based predicates
  /** Product name */
  productName?: string;
  /** SKU value */
  sku?: string;

  // For combined conditions (and/or)
  /** Messages for conditions that are already met */
  qualifiedConditions?: string[];
  /** Messages for conditions that are pending */
  pendingConditions?: string[];
  /** Individual condition results for combined predicates */
  conditions?: EvaluationResult[];
}

/**
 * Options for category resolution
 */
export interface CategoryResolver {
  /**
   * Resolve a category ID to its display name
   * @param categoryId - The category ID to resolve
   * @returns The category name, or undefined if not found
   */
  (categoryId: string): string | undefined | Promise<string | undefined>;
}

/**
 * Context for predicate evaluation
 */
export interface EvaluationContext {
  /** The cart being evaluated */
  cart: Cart;

  /** Current line item context (used when evaluating inside lineItemExists, etc.) */
  currentLineItem?: LineItem;

  /** Optional function to resolve category IDs to names */
  categoryResolver?: CategoryResolver;

  /** Currency code for the cart (used for money comparisons) */
  currencyCode?: string;
}

/**
 * Options for the evaluatePredicate function
 */
export interface EvaluatePredicateOptions {
  /** Function to resolve category IDs to display names */
  categoryResolver?: CategoryResolver;
}

/**
 * Parsed money value
 */
export interface ParsedMoney {
  /** Amount in cents (integer) */
  centAmount: number;
  /** Currency code (e.g., "USD", "EUR") */
  currencyCode: string;
  /** Original amount as decimal */
  amount: number;
}
