import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Money } from '@commercetools/platform-sdk';
import { useCallback } from 'react';

export const useMoney = () => {
  const context = useApplicationContext((context) => context);
  const convertMoneytoString = useCallback(
    (money: Money) => {
      return new Intl.NumberFormat(context?.dataLocale ?? 'en-US', {
        style: 'currency',
        currency: money.currencyCode,
      }).format((money.centAmount || 0) / 100);
    },
    [context?.dataLocale]
  );

  return {
    convertMoneytoString,
  };
};
