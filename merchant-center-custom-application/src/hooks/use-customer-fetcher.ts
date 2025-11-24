import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import {
  Cart,
  Customer,
  PagedQueryResponse,
} from '@commercetools/platform-sdk';
import { buildUrlWithParams } from '../utils/url';

export const useCustomerFetcher = () => {
  const context = useApplicationContext((context) => context);

  const dispatchCustomerAction = useAsyncDispatch<TSdkAction, Customer>();
  const dispatchCustomersRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse
  >();

  const getCustomer = async (customerId: string): Promise<Customer> => {
    const result = await dispatchCustomerAction(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(
          `/${context?.project?.key}/customers/${customerId}`,
          {}
        ),
      })
    );
    return result;
  };

  const getCustomers = async (): Promise<Customer[]> => {
    const result = await dispatchCustomersRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/customers`, {
          limit: '500',
        }),
      })
    );
    return result?.results as Customer[];
  };

  return {
    getCustomer,
    getCustomers,
  };
};
