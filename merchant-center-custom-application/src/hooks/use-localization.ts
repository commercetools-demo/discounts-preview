import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { LocalizedString, Money } from '@commercetools/platform-sdk';
import { useCallback } from 'react';

export const useMoney = () => {
  const context = useApplicationContext((context) => context);
  const addMoney = useCallback(
    (money1?: Money, money2?: Money) => {
      if (!money1 || !money2) return null;
      return {
        centAmount: money1.centAmount + money2.centAmount,
        currencyCode: money1.currencyCode,
      };
    },
    [context?.dataLocale]
  );

  const subtractMoney = useCallback(
    (money1?: Money, money2?: Money) => {
      if (!money1 || !money2) return null;
      return {
        centAmount: money1.centAmount - money2.centAmount,
        currencyCode: money1.currencyCode,
      };
    },
    [context?.dataLocale]
  );

  const multiplyMoney = useCallback(
    (money?: Money | null, multiplier?: number) => {
      if (!money || !multiplier) return null;
      return {
        centAmount: money.centAmount * (multiplier || 0),
        currencyCode: money.currencyCode,
      };
    },
    [context?.dataLocale]
  );

  const divideMoney = useCallback(
    (money?: Money | null, divisor?: number) => {
      if (!money || !divisor) return null;
      return {
        centAmount: money.centAmount / (divisor || 0),
        currencyCode: money.currencyCode,
      };
    },
    [context?.dataLocale]
  );

  const convertMoneytoString = useCallback(
    (money?: Money | null) => {
      if (!money) return '';
      return new Intl.NumberFormat(context?.dataLocale ?? 'en-US', {
        style: 'currency',
        currency: money.currencyCode,
      }).format((money.centAmount || 0) / 100);
    },
    [context?.dataLocale]
  );

  return {
    addMoney,
    subtractMoney,
    multiplyMoney,
    divideMoney,
    convertMoneytoString,
  };
};

export const useLocalizedString = () => {
  const context = useApplicationContext((context) => context);
  const convertLocalizedString = useCallback(
    (localizedString?: LocalizedString) => {
      return localizedString?.[context?.dataLocale ?? 'en-US'] ?? '';
    },
    [context?.dataLocale]
  );

  return {
    convertLocalizedString,
  };
};
