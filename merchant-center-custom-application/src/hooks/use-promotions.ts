import type {
  Cart,
  DiscountCode,
  DiscountCodePagedQueryResponse,
  Money,
} from '@commercetools/platform-sdk';
import { buildUrlWithParams } from '../utils/url';
import { useCallback } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { useShadowCart } from './use-shadow-cart';
import { useMoney, useLocalizedString } from './use-localization';

export interface PromotionWithValue extends DiscountCode {
  totalCart: Money | null;
  discountValue: Money | null;
  cartLevelDiscount: Money | null;
  itemLevelDiscounts: Money | null;
  includedDiscounts: DiscountBreakdown[];
  includedItemLevelDiscounts: ItemLevelDiscountBreakdown[];
  isApplicable: boolean;
}

export interface DiscountBreakdown {
  name: string;
  amount: Money;
}

export interface ItemLevelDiscountBreakdown {
  skuName: string;
  name: string;
  amount: Money;
}

export const usePromotions = () => {
  const context = useApplicationContext((context) => context);
  const dispatchPromotionsAction = useAsyncDispatch<
    TSdkAction,
    DiscountCodePagedQueryResponse
  >();

  const { createShadowCart, deleteShadowCart } = useShadowCart();
  const { addMoney } = useMoney();
  const { convertLocalizedString } = useLocalizedString();

  const getPromotions = useCallback(
    async (
      limit?: number,
      offset?: number
    ): Promise<DiscountCodePagedQueryResponse> => {
      const result = await dispatchPromotionsAction(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/discount-codes`, {
            where: 'isActive=true',
            expand: ['cartDiscounts[*]'],
            ...(limit ? { limit: limit.toString() } : {}),
            ...(offset ? { offset: offset.toString() } : {}),
          }),
        })
      );
      return result;
    },
    [context?.project?.key]
  );

  const calculatePromotionValues = useCallback(
    async (
      discountCodes: DiscountCode[],
      cartData: Cart
    ): Promise<PromotionWithValue[]> => {
      console.log('Calculating promotion values...');

      const promotionsWithValues = await Promise.all(
        discountCodes.map(async (code) => {
          console.log('Processing discount code:', code.code);

          try {
            const shadowCart = await createShadowCart(cartData, code.code);

            let cartLevelDiscount: Money | null = null;
            let itemLevelDiscounts: Money | null = null;
            const includedDiscounts: DiscountBreakdown[] = [];
            const includedItemLevelDiscounts: ItemLevelDiscountBreakdown[] = [];

            // Check for cart-level discount
            if (shadowCart.discountOnTotalPrice?.discountedAmount) {
              cartLevelDiscount =
                shadowCart.discountOnTotalPrice.discountedAmount;

              // Extract included discounts at cart level
              if (shadowCart.discountOnTotalPrice.includedDiscounts) {
                for (const discount of shadowCart.discountOnTotalPrice
                  .includedDiscounts) {
                  const discountRef = discount.discount as {
                    obj?: { name?: Record<string, string> };
                  };
                  includedDiscounts.push({
                    name:
                      convertLocalizedString(discountRef.obj?.name) ||
                      'Unnamed Discount',
                    amount: discount.discountedAmount,
                  });
                }
              }
            }

            // Calculate line item discounts
            for (const item of shadowCart.lineItems) {
              if (
                item.discountedPricePerQuantity &&
                item.discountedPricePerQuantity.length > 0
              ) {
                for (const priceQuantity of item.discountedPricePerQuantity) {
                  if (priceQuantity.discountedPrice?.includedDiscounts) {
                    for (const discount of priceQuantity.discountedPrice
                      .includedDiscounts) {
                      const discountRef = discount.discount as {
                        obj?: { name?: Record<string, string> };
                      };
                      includedItemLevelDiscounts.push({
                        skuName:
                          convertLocalizedString(item.name) || 'Unknown SKU',
                        name:
                          convertLocalizedString(discountRef.obj?.name) ||
                          'Unnamed Discount',
                        amount: discount.discountedAmount,
                      });

                      // Accumulate item level discounts
                      itemLevelDiscounts =
                        addMoney(
                          itemLevelDiscounts ?? undefined,
                          discount.discountedAmount
                        ) ?? null;
                    }
                  }
                }
              }
            }

            // Calculate total discount value
            const discountValue =
              addMoney(
                cartLevelDiscount ?? undefined,
                itemLevelDiscounts ?? undefined
              ) ?? null;

            // Delete the shadow cart as it's no longer required
            await deleteShadowCart(shadowCart);

            return {
              ...code,
              totalCart: shadowCart.totalPrice,
              discountValue,
              cartLevelDiscount,
              itemLevelDiscounts,
              includedDiscounts,
              includedItemLevelDiscounts,
              isApplicable: true,
            };
          } catch (error) {
            console.error(
              `Error processing discount code ${code.code}:`,
              error
            );
            // Return the code with null values on error
            return {
              ...code,
              totalCart: null,
              discountValue: null,
              cartLevelDiscount: null,
              itemLevelDiscounts: null,
              includedDiscounts: [],
              includedItemLevelDiscounts: [],
              isApplicable: false,
            };
          }
        })
      );

      return promotionsWithValues.sort((a, b) => {
        if (a.totalCart === null) return 1;
        if (b.totalCart === null) return -1;
        if (a.isApplicable && !b.isApplicable) return -1;
        if (!a.isApplicable && b.isApplicable) return 1;
        return (a.totalCart.centAmount ?? 0) - (b.totalCart.centAmount ?? 0);
      });
    },
    [createShadowCart, deleteShadowCart, addMoney, convertLocalizedString]
  );

  return {
    getPromotions,
    calculatePromotionValues,
  };
};
