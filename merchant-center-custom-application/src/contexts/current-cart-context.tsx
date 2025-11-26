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
  updatingLineItems: Set<string>;
  applyBestPromo: boolean;
  setApplyBestPromo: (applyBestPromo: boolean) => void;
  setCurrentCart: (cart: Cart | null) => void;
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

const CART_EXPAND = [
  'discountCodes[*].discountCode',
  'discountOnTotalPrice.includedDiscounts[*].discount',
  'lineItems[*].discountedPricePerQuantity[*].discountedPrice.includedDiscounts[*].discount',
  'lineItems[*].price.discounted.discount',
];

export const CurrentCartProvider: React.FC<CurrentCartProviderProps> = ({
  children,
}) => {
  const {
    getCarts,
    updateLineItemQuantity: updateLineItemQuantityAction,
    getCart,
    applyDiscountCode: applyDiscountCodeAction,
    removeDiscountCode: removeDiscountCodeAction,
  } = useCartFetcher();
  const { currentCustomer } = useCurrentCustomer();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [currentCart, setCurrentCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyBestPromo, setApplyBestPromo] = useState(false);

  const [updatingLineItems, setUpdatingLineItems] = useState<Set<string>>(
    new Set()
  );

  const onSetCurrentCart = useCallback(async (cart: Cart | null) => {
    if (cart) {
      const cartWithExpand = await getCart(cart.id, CART_EXPAND);
      setCurrentCart(cartWithExpand);
    } else {
      setCurrentCart(null);
    }
  }, []);

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
          newQuantity,
          CART_EXPAND
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

      if (
        currentCart.discountCodes?.some(
          (code) => code.discountCode?.obj?.code === discountCode
        )
      ) {
        console.log('Discount code already applied:', discountCode);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await applyDiscountCodeAction(
          currentCart.id,
          discountCode,
          CART_EXPAND
        );
        setCurrentCart(updatedCart);
      } catch (err) {
        console.error('Error applying discount code:', err);
        setError('Failed to apply discount code');
      } finally {
        setIsLoading(false);
      }
    },
    [currentCart]
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
        const updatedCart = await removeDiscountCodeAction(
          currentCart.id,
          discountCodeId,
          CART_EXPAND
        );
        setCurrentCart(updatedCart);
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
    updatingLineItems,
    applyBestPromo,
    setApplyBestPromo,
    setCurrentCart: onSetCurrentCart,
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
