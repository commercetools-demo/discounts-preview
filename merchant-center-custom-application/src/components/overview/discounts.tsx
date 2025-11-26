import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import DataTable from '@commercetools-uikit/data-table';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { CheckActiveIcon, CheckInactiveIcon } from '@commercetools-uikit/icons';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Stamp from '@commercetools-uikit/stamp';
import Text from '@commercetools-uikit/text';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { designTokens } from '@commercetools-uikit/design-system';
import {
  CartDiscount,
  LocalizedString,
  PagedQueryResponse,
  ProductDiscount,
} from '@commercetools/platform-sdk';
import styled from '@emotion/styled';
import { useCartDiscounts } from '../../hooks/use-cart-discounts';
import { useLocalizedString } from '../../hooks/use-localization';
import { useProductDiscounts } from '../../hooks/use-product-discounts';
import messages from './messages';

const Container = styled.div`
  background-color: ${designTokens.colorNeutral95};
  min-height: 100vh;
  padding: 20px;
`;

type TDiscountRow = {
  id: string;
  type: 'product' | 'cart';
  key?: string | null;
  name?: LocalizedString;
  isActive: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt: string;
};

const columns = [
  { key: 'name', label: 'Name', width: '20%', isTruncated: true },
  { key: 'key', label: 'Key', isSortable: true },
  { key: 'type', label: 'Type' },
  { key: 'isActive', label: 'Active', isSortable: true },
  { key: 'validFrom', label: 'Valid From' },
  { key: 'validUntil', label: 'Valid To' },
  { key: 'createdAt', label: 'Date Created', isSortable: true },
];

type TDiscountsProps = {
  linkToWelcome: string;
};

const Discounts = (props: TDiscountsProps) => {
  const intl = useIntl();
  const { getCartDiscounts } = useCartDiscounts();
  const { getProductDiscounts } = useProductDiscounts();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const { convertLocalizedString } = useLocalizedString();
  const tableSorting = useDataTableSortingState({
    key: 'createdAt',
    order: 'desc',
  });
  const { dataLocale, projectLanguages, projectKey } = useApplicationContext(
    (context) => ({
      dataLocale: context.dataLocale,
      projectLanguages: context.project?.languages,
      projectKey: context.project?.key,
    })
  );

  const [cartDiscountsPaginatedResult, setCartDiscountsPaginatedResult] =
    useState<PagedQueryResponse>();
  const [cartDiscountsError, setCartDiscountsError] = useState<string | null>(
    null
  );
  const [cartDiscountsLoading, setCartDiscountsLoading] = useState(false);
  const [productDiscountsPaginatedResult, setProductDiscountsPaginatedResult] =
    useState<PagedQueryResponse>();
  const [productDiscountsError, setProductDiscountsError] = useState<
    string | null
  >(null);
  const [productDiscountsLoading, setProductDiscountsLoading] = useState(false);

  const combinedDiscounts = useMemo(() => {
    const productDiscounts: TDiscountRow[] =
      (productDiscountsPaginatedResult?.results as ProductDiscount[])?.map(
        (discount) => ({
          id: discount.id,
          type: 'product' as const,
          key: discount.key,
          name: discount.name,
          isActive: discount.isActive,
          validFrom: discount.validFrom,
          validUntil: discount.validUntil,
          createdAt: discount.createdAt,
        })
      ) || [];

    const cartDiscounts: TDiscountRow[] =
      (cartDiscountsPaginatedResult?.results as CartDiscount[])?.map(
        (discount) => ({
          id: discount.id,
          type: 'cart' as const,
          key: discount.key,
          name: discount.name,
          isActive: discount.isActive,
          validFrom: discount.validFrom,
          validUntil: discount.validUntil,
          createdAt: discount.createdAt,
        })
      ) || [];

    return [...productDiscounts, ...cartDiscounts].sort((a, b) => {
      const key = tableSorting.value.key;
      const order = tableSorting.value.order;

      let comparison = 0;
      if (key === 'createdAt' || key === 'validFrom' || key === 'validUntil') {
        const aValue = a[key as keyof TDiscountRow] as
          | string
          | null
          | undefined;
        const bValue = b[key as keyof TDiscountRow] as
          | string
          | null
          | undefined;
        comparison = (aValue || '').localeCompare(bValue || '');
      } else if (key === 'name') {
        const aName = convertLocalizedString(a.name);
        const bName = convertLocalizedString(b.name);
        comparison = aName.localeCompare(bName);
      } else if (key === 'key') {
        comparison = (a.key || '').localeCompare(b.key || '');
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, [
    productDiscountsPaginatedResult,
    cartDiscountsPaginatedResult,
    tableSorting.value,
    dataLocale,
    projectLanguages,
  ]);

  const minimunItems = useMemo(
    () =>
      Math.min(
        productDiscountsPaginatedResult?.total || 0,
        cartDiscountsPaginatedResult?.total || 0
      ),
    [productDiscountsPaginatedResult, cartDiscountsPaginatedResult]
  );

  const loading = productDiscountsLoading || cartDiscountsLoading;
  const error = productDiscountsError || cartDiscountsError;

  useEffect(() => {
    setCartDiscountsLoading(true);
    setProductDiscountsLoading(true);
    getCartDiscounts(
      undefined,
      perPage.value,
      (page.value - 1) * perPage.value,
      tableSorting.value
    )
      .then(setCartDiscountsPaginatedResult)
      .catch((err) => setCartDiscountsError(err.message))
      .finally(() => setCartDiscountsLoading(false));

    getProductDiscounts(
      undefined,
      perPage.value,
      (page.value - 1) * perPage.value,
      tableSorting.value
    )
      .then(setProductDiscountsPaginatedResult)
      .catch((err) => setProductDiscountsError(err.message))
      .finally(() => setProductDiscountsLoading(false));
  }, [
    page.value,
    perPage.value,
    tableSorting.value.key,
    tableSorting.value.order,
  ]);

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{error}</Text.Body>
      </ContentNotification>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return NO_VALUE_FALLBACK;
    return intl.formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (row: TDiscountRow) => {
    if (row.type === 'product') {
      push(`/${projectKey}/discounts/products/${row.id}`);
    } else {
      push(`/${projectKey}/discounts/carts/${row.id}`);
    }
  };

  return (
    <Container>
      <Spacings.Stack scale="s">
        <Spacings.Stack scale="s">
          <Text.Headline as="h1" intlMessage={messages.title} />
        </Spacings.Stack>

        {loading && <LoadingSpinner />}

        {!loading && combinedDiscounts.length > 0 ? (
          <Spacings.Stack scale="s">
            <DataTable<TDiscountRow>
              isCondensed
              columns={columns.map((col) => ({
                ...col,
                label: col.label,
              }))}
              rows={combinedDiscounts}
              itemRenderer={(item, column) => {
                switch (column.key) {
                  case 'type':
                    return (
                      <Stamp
                        tone={item.type === 'product' ? 'primary' : 'secondary'}
                        label={item.type}
                      />
                    );
                  case 'name':
                    return convertLocalizedString(item.name);
                  case 'key':
                    return item.key || NO_VALUE_FALLBACK;
                  case 'isActive':
                    return item.isActive ? (
                      <CheckActiveIcon color="success" />
                    ) : (
                      <CheckInactiveIcon color="neutral60" />
                    );
                  case 'validFrom':
                    return formatDate(item.validFrom);
                  case 'validUntil':
                    return formatDate(item.validUntil);
                  case 'createdAt':
                    return formatDate(item.createdAt);
                  default:
                    return null;
                }
              }}
              sortedBy={tableSorting.value.key}
              sortDirection={tableSorting.value.order}
              onSortChange={tableSorting.onChange}
              onRowClick={handleRowClick}
            />
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={minimunItems}
              perPageRange="s"
            />
          </Spacings.Stack>
        ) : null}
      </Spacings.Stack>
    </Container>
  );
};
Discounts.displayName = 'Discounts';

export default Discounts;
