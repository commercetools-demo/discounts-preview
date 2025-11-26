import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import type { DiscountCode } from '@commercetools/platform-sdk';
import { usePromotions } from '../hooks/use-promotions';

interface PromotionContextValue {
  promotions: DiscountCode[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setLimit: (limit: number) => void;
  onPageChange: (page: number) => void;
  refreshPromotions: () => Promise<void>;
}

const PromotionContext = createContext<PromotionContextValue | undefined>(
  undefined
);

interface PromotionProviderProps {
  children: ReactNode;
}

export const PromotionProvider: React.FC<PromotionProviderProps> = ({
  children,
}) => {
  const { getPromotions } = usePromotions();
  const [promotions, setPromotions] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const refreshPromotions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPromotions(limit, (page - 1) * limit);
      setTotal(result.total ?? 0);
      setPromotions(result.results as DiscountCode[]);
    } catch (err) {
      console.error('Error loading promotions:', err);
      setError('Failed to load promotions');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getPromotions, limit, page]);

  const onPageChange = (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
      refreshPromotions();
    }
  };

  // Load promotions on mount and when page/limit changes
  useEffect(() => {
    refreshPromotions();
  }, [refreshPromotions]);

  const value: PromotionContextValue = {
    promotions,
    isLoading,
    error,
    page,
    totalPages,
    refreshPromotions,
    setLimit,
    onPageChange,
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotionContext = (): PromotionContextValue => {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error(
      'usePromotionContext must be used within a PromotionProvider'
    );
  }
  return context;
};
