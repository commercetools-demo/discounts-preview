import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import type { CartDiscount } from '@commercetools/platform-sdk';
import { useCartDiscounts } from '../hooks/use-cart-discounts';

interface AutoDiscountsContextValue {
  autoDiscounts: CartDiscount[];
  isLoading: boolean;
  error: string | null;
  refreshAutoDiscounts: () => Promise<void>;
}

const AutoDiscountsContext = createContext<
  AutoDiscountsContextValue | undefined
>(undefined);

interface AutoDiscountsProviderProps {
  children: ReactNode;
}

export const AutoDiscountsProvider: React.FC<AutoDiscountsProviderProps> = ({
  children,
}) => {
  const { loadAutoDiscounts } = useCartDiscounts();
  const [autoDiscounts, setAutoDiscounts] = useState<CartDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAutoDiscounts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const discounts = await loadAutoDiscounts();
      setAutoDiscounts(discounts);
    } catch (err) {
      console.error('Error loading auto discounts:', err);
      setError('Failed to load auto-triggered discounts');
      setAutoDiscounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadAutoDiscounts]);

  // Load auto discounts on mount
  useEffect(() => {
    refreshAutoDiscounts();
  }, [refreshAutoDiscounts]);

  const value: AutoDiscountsContextValue = {
    autoDiscounts,
    isLoading,
    error,
    refreshAutoDiscounts,
  };

  return (
    <AutoDiscountsContext.Provider value={value}>
      {children}
    </AutoDiscountsContext.Provider>
  );
};

export const useAutoDiscounts = (): AutoDiscountsContextValue => {
  const context = useContext(AutoDiscountsContext);
  if (context === undefined) {
    throw new Error(
      'useAutoDiscounts must be used within an AutoDiscountsProvider'
    );
  }
  return context;
};
