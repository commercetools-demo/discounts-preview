import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import type { PagedQueryResponse } from '@commercetools/platform-sdk';
import { useCallback } from 'react';
import { buildUrlWithParams } from '../utils/url';

type SortInput = {
  key: string;
  order: 'asc' | 'desc';
};

export const useProductDiscounts = () => {
  const context = useApplicationContext((context) => context);
  const dispatchCartAction = useAsyncDispatch<TSdkAction, PagedQueryResponse>();

  const getProductDiscounts = useCallback(
    async (
      where?: string,
      limit?: number,
      offset?: number,
      sort?: SortInput
    ): Promise<PagedQueryResponse> => {
      const result = await dispatchCartAction(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: buildUrlWithParams(
            `/${context?.project?.key}/product-discounts`,
            {
              ...(where ? { where: where } : {}),
              ...(limit ? { limit: limit.toString() } : {}),
              ...(offset ? { offset: offset.toString() } : {}),
              ...(sort ? { sort: `${sort.key} ${sort.order}` } : {}),
            }
          ),
        })
      );
      return result;
    },
    [context?.project?.key]
  );

  return {
    getProductDiscounts,
  };
};
