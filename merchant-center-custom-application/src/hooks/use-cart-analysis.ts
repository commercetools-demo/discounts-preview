import type { Cart, CartDiscount } from '@commercetools/platform-sdk';
import { useCallback, useEffect, useState } from 'react';
import { evaluatePredicate, type EvaluationResult } from '../utils/discount';
import { useCartDiscounts } from './use-cart-discounts';
import { useLocalizedString } from './use-localization';

export interface CategoryData {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

export interface CartAnalysis {
  categories: CategoryData[];
  totalProducts: number;
  autoDiscounts: CartDiscount[];
  discountAnalysis: DiscountAnalysis[];
  error: string | null;
}

export interface DiscountAnalysis {
  discount: CartDiscount;
  isApplicable: boolean;
  type: string;
  qualificationStatus: 'QUALIFIED' | 'PENDING' | 'NOT_APPLICABLE' | 'UNKNOWN';
  qualificationMessage?: string;
  qualifiedConditions?: string[];
  pendingConditions?: string[];
  categoryName?: string;
  categoryNames?: string;
  currentAmount?: number;
  requiredAmount?: number;
  currentCount?: number;
  requiredCount?: number;
  remainingAmount?: number;
  remainingCount?: number;
}

/**
 * Hook for analyzing cart data against auto-triggered discounts
 */
export const useCartAnalysis = (cartData: Cart | null) => {
  const [cartAnalysis, setCartAnalysis] = useState<CartAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { convertLocalizedString } = useLocalizedString();
  const { getAutoApplicableDiscounts } = useCartDiscounts();
  const [autoDiscounts, setAutoDiscounts] = useState<CartDiscount[]>([]);
  const [autoDiscountsError, setAutoDiscountsError] = useState<string | null>(
    null
  );

  const extractLineItemCategories = (
    lineItem: Cart['lineItems'][number]
  ): Array<{ id: string; name?: string }> => {
    // Categories might be in different places depending on your setup:
    // 1. On the product (if expanded)
    // 2. In custom fields
    // 3. In variant attributes

    const categories: Array<{ id: string; name?: string }> = [];

    // Check for categories on variant (if your data model includes them)
    const variant = lineItem.variant as
      | (typeof lineItem.variant & {
          categories?: Array<{ id: string; name?: Record<string, string> }>;
        })
      | undefined;

    if (variant?.categories) {
      for (const cat of variant.categories) {
        categories.push({
          id: cat.id,
          name: convertLocalizedString(cat.name),
        });
      }
    }

    // Check custom fields for category information
    const custom = lineItem.custom;
    if (custom?.fields) {
      const categoryField =
        custom.fields['category'] || custom.fields['categoryId'];
      if (typeof categoryField === 'string') {
        categories.push({ id: categoryField });
      }
    }

    return categories;
  };

  /**
   * Extract category data from cart line items
   */
  const extractCategoryData = useCallback(
    (cart: Cart): { categories: CategoryData[]; totalProducts: number } => {
      const categoryMap = new Map<string, CategoryData>();
      let totalProducts = 0;

      for (const lineItem of cart.lineItems || []) {
        totalProducts += lineItem.quantity || 0;

        // Extract categories from line item
        // Categories might be on the product or in custom fields
        const categories = extractLineItemCategories(lineItem);

        for (const category of categories) {
          const existing = categoryMap.get(category.id);
          if (existing) {
            existing.quantity += lineItem.quantity || 0;
            existing.totalPrice += lineItem.totalPrice?.centAmount || 0;
          } else {
            categoryMap.set(category.id, {
              id: category.id,
              name: category.name || category.id,
              quantity: lineItem.quantity || 0,
              totalPrice: lineItem.totalPrice?.centAmount || 0,
            });
          }
        }
      }

      return {
        categories: Array.from(categoryMap.values()),
        totalProducts,
      };
    },
    []
  );

  /**
   * Analyze discounts against the cart using the predicate evaluator
   */
  const analyzeDiscounts = useCallback(
    async (
      discounts: CartDiscount[],
      categoryData: { categories: CategoryData[]; totalProducts: number },
      cart: Cart
    ): Promise<DiscountAnalysis[]> => {
      const results: DiscountAnalysis[] = [];

      for (const discount of discounts) {
        // Skip inactive discounts
        if (!discount.isActive) {
          results.push({
            discount,
            isApplicable: false,
            type: 'INACTIVE',
            qualificationStatus: 'NOT_APPLICABLE',
            qualificationMessage: 'Discount is not active',
          });
          continue;
        }

        // Evaluate the predicate
        const evaluation = await evaluatePredicate(
          discount.cartPredicate,
          cart,
          {
            categoryResolver: (categoryId: string) => {
              const category = categoryData.categories.find(
                (c) => c.id === categoryId
              );
              return category?.name;
            },
          }
        );

        results.push(mapEvaluationToAnalysis(discount, evaluation));
      }

      return results;
    },
    []
  );

  /**
   * Full cart analysis
   */
  const analyzeCart = useCallback(
    async (cart: Cart): Promise<CartAnalysis> => {
      // Extract category data
      const categoryData = extractCategoryData(cart);

      // Analyze each discount
      const discountAnalysis = await analyzeDiscounts(
        autoDiscounts,
        categoryData,
        cart
      );

      return {
        categories: categoryData.categories,
        totalProducts: categoryData.totalProducts,
        autoDiscounts: autoDiscounts,
        discountAnalysis,
        error: autoDiscountsError,
      };
    },
    [autoDiscounts, extractCategoryData, analyzeDiscounts]
  );

  /**
   * Trigger analysis when cart data changes
   */
  const analyzeCartData = useCallback(async (): Promise<void> => {
    if (!cartData || autoDiscounts.length === 0) return;

    setIsAnalyzing(true);

    try {
      const analysis = await analyzeCart(cartData);
      setCartAnalysis(analysis);
    } catch (err) {
      console.error('Error analyzing cart:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [cartData, autoDiscounts, analyzeCart]);

  // Run analysis when cart changes
  useEffect(() => {
    if (cartData) {
      analyzeCartData();
    }
  }, [cartData, analyzeCartData]);
  // Run analysis when cart changes
  useEffect(() => {
    getAutoApplicableDiscounts(500, 0)
      .then((discounts) => {
        setAutoDiscounts(discounts.results as CartDiscount[]);
      })
      .catch((err) => {
        setAutoDiscountsError('Failed to load auto-triggered discounts');
      });
  }, []);

  return {
    cartAnalysis,
    isAnalyzing,
  };
};

/**
 * Map an EvaluationResult to a DiscountAnalysis
 */
function mapEvaluationToAnalysis(
  discount: CartDiscount,
  evaluation: EvaluationResult
): DiscountAnalysis {
  return {
    discount,
    isApplicable: evaluation.isApplicable,
    type: evaluation.type,
    qualificationStatus: evaluation.qualificationStatus,
    qualificationMessage: evaluation.qualificationMessage,
    qualifiedConditions: evaluation.qualifiedConditions,
    pendingConditions: evaluation.pendingConditions,
    categoryName: evaluation.categoryName,
    categoryNames: evaluation.categoryNames,
    currentAmount: evaluation.currentAmount,
    requiredAmount: evaluation.requiredAmount,
    currentCount: evaluation.currentCount,
    requiredCount: evaluation.requiredCount,
    remainingAmount: evaluation.remainingAmount,
    remainingCount: evaluation.remainingCount,
  };
}
