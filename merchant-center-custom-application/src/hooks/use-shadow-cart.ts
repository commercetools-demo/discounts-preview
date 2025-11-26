import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import type { Cart } from '@commercetools/platform-sdk';
import { buildUrlWithParams } from '../utils/url';
import { useCallback } from 'react';

export const useShadowCart = () => {
  const context = useApplicationContext((context) => context);
  const dispatchCartAction = useAsyncDispatch<TSdkAction, Cart>();

  /**
   * Creates a shadow cart from the input cart with a new discount code applied.
   * The shadow cart is a copy of the original cart with the discount code applied,
   * used to calculate the potential discount value.
   */
  const createShadowCart = useCallback(
    async (cartData: Cart, newDiscountCode: string): Promise<Cart> => {
      // Extract existing discount codes from the cart
      const existingDiscountCodes = cartData.discountCodes
        ? cartData.discountCodes
            .map((dc) => {
              const discountCodeRef = dc.discountCode as {
                obj?: { code: string };
              };
              return discountCodeRef.obj?.code ?? '';
            })
            .filter(Boolean)
        : [];

      // Combine existing discount codes with the new one, ensuring no duplicates
      const allDiscountCodes = [
        ...new Set([...existingDiscountCodes, newDiscountCode]),
      ];

      // Build line items for the shadow cart
      const lineItems = cartData.lineItems.map((item) => {
        const lineItem: {
          productId: string;
          quantity: number;
          distributionChannel?: { id: string; typeId: 'channel' };
          supplyChannel?: { id: string; typeId: 'channel' };
        } = {
          productId: item.productId,
          quantity: item.quantity,
        };

        if (item.distributionChannel?.id) {
          lineItem.distributionChannel = {
            id: item.distributionChannel.id,
            typeId: 'channel',
          };
        }

        if (item.supplyChannel?.id) {
          lineItem.supplyChannel = {
            id: item.supplyChannel.id,
            typeId: 'channel',
          };
        }

        return lineItem;
      });

      const result = await dispatchCartAction(
        actions.post({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts`, {
            expand: [
              'discountCodes[*].discountCode',
              'discountOnTotalPrice.includedDiscounts[*].discount',
              'lineItems[*].discountedPricePerQuantity[*].discountedPrice.includedDiscounts[*].discount',
            ],
          }),
          payload: {
            currency: cartData.totalPrice.currencyCode,
            lineItems,
            discountCodes: allDiscountCodes,
            country: cartData.country,
          },
        })
      );

      return result;
    },
    [context?.project?.key, dispatchCartAction]
  );

  /**
   * Deletes a shadow cart by its ID and version.
   */
  const deleteShadowCart = useCallback(
    async (shadowCart: Cart): Promise<void> => {
      await dispatchCartAction(
        actions.del({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(
            `/${context?.project?.key}/carts/${shadowCart.id}`,
            {
              version: shadowCart.version.toString(),
            }
          ),
        })
      );
    },
    [context?.project?.key, dispatchCartAction]
  );

  return {
    createShadowCart,
    deleteShadowCart,
  };
};
