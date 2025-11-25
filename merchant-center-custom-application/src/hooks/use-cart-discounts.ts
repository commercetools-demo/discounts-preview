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

  const loadAutoDiscounts = useCallback(
    async (limit?: number, offset?: number): Promise<PagedQueryResponse> => {
      try {
        const result = await dispatchCartAction(
          actions.get({
            mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
            uri: buildUrlWithParams(
              `/${context?.project?.key}/cart-discounts`,
              {
                where: 'requiresDiscountCode=false',
                ...(limit ? { limit: limit.toString() } : {}),
                ...(offset ? { offset: offset.toString() } : {}),
              }
            ),
          })
        );
        return result;
      } catch (err) {
        return {
          limit: 0,
          offset: 0,
          count: 0,
          results: [],
          total: 0,
        };
      }
    },
    []
  );

  return {
    loadAutoDiscounts,
  };
};
