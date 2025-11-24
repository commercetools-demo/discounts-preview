import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { Customer } from '@commercetools/platform-sdk';
import { useCustomerFetcher } from '../hooks/use-customer-fetcher';

interface CurrentUserContextValue {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  currentCustomer: Customer | null;
  setCurrentCustomer: (customer: Customer | null) => void;
  fetchCustomers: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(
  undefined
);

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const { getCustomers } = useCustomerFetcher();

  const fetchCustomers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      getCustomers().then((customers) => {
        setCustomers(customers);
      });
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const value: CurrentUserContextValue = {
    customers,
    isLoading,
    error,
    fetchCustomers,
    currentCustomer,
    setCurrentCustomer,
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentCustomer = (): CurrentUserContextValue => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error(
      'useCurrentCustomer must be used within a CurrentUserProvider'
    );
  }
  return context;
};
