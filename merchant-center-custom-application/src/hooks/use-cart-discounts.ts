import { useState, useEffect, useCallback } from 'react';
import type {
  CartDiscount,
  PagedQueryResponse,
} from '@commercetools/platform-sdk';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { buildUrlWithParams } from '../utils/url';
export const useCartDiscounts = () => {
  const context = useApplicationContext((context) => context);
  const dispatchCartAction = useAsyncDispatch<TSdkAction, PagedQueryResponse>();

  const loadAutoDiscounts = useCallback(async (): Promise<CartDiscount[]> => {
    try {
      const result = await dispatchCartAction(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(`/${context?.project?.key}/cart-discounts`, {
            where: 'requiresDiscountCode=false',
          }),
        })
      );
      return result.results as CartDiscount[];
    } catch (err) {
      return [];
    }
  }, []);

  const getAutoTriggeredDiscounts = async (): Promise<{
    promotions: CartDiscount[];
    error: string | null;
  }> => {
    // TODO: Implement getting auto-triggered discounts

    // Empty implementation - will be filled later
    return { promotions: [], error: null };
  };

  return {
    loadAutoDiscounts,
    getAutoTriggeredDiscounts,
  };
};
