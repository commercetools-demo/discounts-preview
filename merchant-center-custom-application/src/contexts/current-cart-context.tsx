import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import type { Cart } from '@commercetools/platform-sdk';
import { useCartFetcher } from '../hooks/use-cart-fetcher';
import { useCurrentCustomer } from './current-user-context';

interface CurrentCartContextValue {
  carts: Cart[];
  currentCart: Cart | null;
  isLoading: boolean;
  error: string | null;
  appliedDiscountCodes: string[];
  updatingLineItems: Set<string>;
  setCurrentCart: (cart: Cart | null) => void;
  loadCartData: (customerId: string, applyBestPromo: boolean) => Promise<void>;
  updateLineItemQuantity: (
    lineItemId: string,
    newQuantity: number
  ) => Promise<void>;
  applyDiscountCode: (discountCode: string) => Promise<void>;
  removeDiscountCode: (discountCodeId: string) => Promise<void>;
}

const CurrentCartContext = createContext<CurrentCartContextValue | undefined>(
  undefined
);

interface CurrentCartProviderProps {
  children: ReactNode;
}

export const CurrentCartProvider: React.FC<CurrentCartProviderProps> = ({
  children,
}) => {
  const {
    getCarts,
    updateLineItemQuantity: updateLineItemQuantityAction,
    getCart,
  } = useCartFetcher();
  const { currentCustomer } = useCurrentCustomer();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscountCodes, setAppliedDiscountCodes] = useState<string[]>(
    []
  );
  const [updatingLineItems, setUpdatingLineItems] = useState<Set<string>>(
    new Set()
  );

  const onSetCurrentCart = useCallback(async (cart: Cart | null) => {
    if (cart) {
      const cartWithExpand = await getCart(cart.id, [
        'discountCodes[*].discountCode',
        'discountOnTotalPrice.includedDiscounts[*].discount',
        'lineItems[*].discountedPricePerQuantity[*].discountedPrice.includedDiscounts[*].discount',
        'lineItems[*].price.discounted.discount',
      ]);
      setCurrentCart(cartWithExpand);
    } else {
      setCurrentCart(null);
    }
  }, []);

  const loadCartData = useCallback(
    async (customerId: string, applyBestPromo: boolean): Promise<void> => {
      // TODO: Implement cart data loading
      setIsLoading(true);
      setError(null);

      // Empty implementation - will be filled later

      setIsLoading(false);
    },
    []
  );

  const updateLineItemQuantity = useCallback(
    async (lineItemId: string, newQuantity: number): Promise<void> => {
      if (!currentCart) {
        console.error('No cart data available');
        return;
      }

      setUpdatingLineItems((prev) => new Set([...prev, lineItemId]));
      setError(null);

      try {
        const updatedCart = await updateLineItemQuantityAction(
          currentCart.id,
          lineItemId,
          newQuantity
        );
        setCurrentCart(updatedCart);
      } catch (err) {
        console.error('Error updating line item quantity:', err);
        setError('Failed to update quantity. Please try again.');
      } finally {
        setUpdatingLineItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lineItemId);
          return newSet;
        });
      }
    },
    [currentCart]
  );

  const applyDiscountCode = useCallback(
    async (discountCode: string): Promise<void> => {
      // TODO: Implement discount code application
      if (!currentCart) {
        return;
      }

      if (appliedDiscountCodes.includes(discountCode)) {
        console.log('Discount code already applied:', discountCode);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Empty implementation - will be filled later
      } catch (err) {
        console.error('Error applying discount code:', err);
        setError('Failed to apply discount code');
      } finally {
        setIsLoading(false);
      }
    },
    [currentCart, appliedDiscountCodes]
  );

  const removeDiscountCode = useCallback(
    async (discountCodeId: string): Promise<void> => {
      // TODO: Implement discount code removal
      if (!currentCart) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Empty implementation - will be filled later
      } catch (err) {
        console.error('Error removing discount code:', err);
        setError('Failed to remove discount code');
      } finally {
        setIsLoading(false);
      }
    },
    [currentCart]
  );

  useEffect(() => {
    if (currentCustomer) {
      getCarts(
        `customerId = "${currentCustomer.id}" and cartState = "Active"`
      ).then((carts) => {
        setCarts(carts);
      });
    } else {
      setCarts([]);
    }
  }, [currentCustomer?.id, getCarts]);

  const value: CurrentCartContextValue = {
    carts,
    currentCart,
    isLoading,
    error,
    appliedDiscountCodes,
    updatingLineItems,
    setCurrentCart: onSetCurrentCart,
    loadCartData,
    updateLineItemQuantity,
    applyDiscountCode,
    removeDiscountCode,
  };

  return (
    <CurrentCartContext.Provider value={value}>
      {children}
    </CurrentCartContext.Provider>
  );
};

export const useCurrentCart = (): CurrentCartContextValue => {
  const context = useContext(CurrentCartContext);
  if (context === undefined) {
    throw new Error('useCurrentCart must be used within a CurrentCartProvider');
  }
  return context;
};
