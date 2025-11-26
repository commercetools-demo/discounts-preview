import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import {
  Cart,
  ClientResponse,
  PagedQueryResponse,
} from '@commercetools/platform-sdk';
import { buildUrlWithParams } from '../utils/url';
import { useCallback } from 'react';

export const useCartFetcher = () => {
  const context = useApplicationContext((context) => context);

  const dispatchCartAction = useAsyncDispatch<TSdkAction, Cart>();
  const dispatchCartsRead = useAsyncDispatch<TSdkAction, PagedQueryResponse>();

  const getCart = useCallback(
    async (cartId: string, expand?: string[]): Promise<Cart> => {
      const result = await dispatchCartAction(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts/${cartId}`, {
            ...(expand ? { expand } : {}),
          }),
        })
      );
      return result;
    },
    [context?.project?.key]
  );

  const getCarts = useCallback(
    async (where?: string, expand?: string[]): Promise<Cart[]> => {
      const result = await dispatchCartsRead(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts`, {
            ...(where ? { where: where } : {}),
            ...(expand ? { expand } : {}),
            limit: '500',
          }),
        })
      );
      return result?.results as Cart[];
    },
    [context?.project?.key]
  );

  const updateLineItemQuantity = useCallback(
    async (
      cartId: string,
      lineItemId: string,
      newQuantity: number,
      expand?: string[]
    ): Promise<Cart> => {
      const cart = await getCart(cartId);
      const updatedCart = await dispatchCartAction(
        actions.post({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts/${cartId}`, {
            ...(expand ? { expand } : {}),
          }),
          payload: {
            version: cart.version,
            actions: [
              {
                action: 'changeLineItemQuantity',
                lineItemId: lineItemId,
                quantity: newQuantity,
              },
            ],
          },
        })
      );
      return updatedCart;
    },
    [context?.project?.key]
  );

  const applyDiscountCode = useCallback(
    async (
      cartId: string,
      discountCode: string,
      expand?: string[]
    ): Promise<Cart> => {
      const cart = await getCart(cartId);
      const updatedCart = await dispatchCartAction(
        actions.post({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts/${cartId}`, {
            ...(expand ? { expand } : {}),
          }),
          payload: {
            version: cart.version,
            actions: [
              {
                action: 'addDiscountCode',
                code: discountCode,
              },
            ],
          },
        })
      );
      return updatedCart;
    },
    [context?.project?.key]
  );
  const removeDiscountCode = useCallback(
    async (
      cartId: string,
      discountCodeId: string,
      expand?: string[]
    ): Promise<Cart> => {
      const cart = await getCart(cartId);
      const updatedCart = await dispatchCartAction(
        actions.post({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/carts/${cartId}`, {
            ...(expand ? { expand } : {}),
          }),
          payload: {
            version: cart.version,
            actions: [
              {
                action: 'removeDiscountCode',
                discountCode: {
                  typeId: 'discount-code',
                  id: discountCodeId,
                },
              },
            ],
          },
        })
      );
      return updatedCart;
    },
    [context?.project?.key]
  );

  return {
    getCart,
    getCarts,
    updateLineItemQuantity,
    applyDiscountCode,
    removeDiscountCode,
  };
};
