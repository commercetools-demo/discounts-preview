import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Customer } from '@commercetools/platform-sdk';

interface CurrentUserContextValue {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (): Promise<void> => {
    // TODO: Implement customers fetching
    setIsLoading(true);
    setError(null);
    
    try {
      // Empty implementation - will be filled later
      setCustomers([]);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCustomers = useCallback(async (): Promise<void> => {
    await fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const value: CurrentUserContextValue = {
    customers,
    isLoading,
    error,
    fetchCustomers,
    refreshCustomers,
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
    throw new Error('useCurrentCustomer must be used within a CurrentUserProvider');
  }
  return context;
};

