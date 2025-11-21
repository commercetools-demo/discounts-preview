import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { Cart } from '@commercetools/platform-sdk';
import { useCartAnalysis } from '../../hooks/use-cart-analysis';
import LineItemCard from './LineItemCard';
import PotentialDiscountsSection from './PotentialDiscountsSection';
import DiscountAnalysisSection from './DiscountAnalysisSection';
import AppliedDiscountsSection from './AppliedDiscountsSection';
import CartTotalsSection from './CartTotalsSection';
import messages from './messages';

const Container = styled.div`
  background-color: ${designTokens.colorSurface};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.h2`
  font-size: 18px;
  font-weight: 600;
  padding: 16px;
  background-color: ${designTokens.colorPrimary};
  color: ${designTokens.colorSurface};
  border-bottom: 2px solid ${designTokens.colorPrimary25};
  margin: 0;
`;

const ContentArea = styled.div`
  padding: 24px;
`;

const LoadingContainer = styled.div`
  padding: 24px;
  text-align: center;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${designTokens.colorNeutral60};
`;

const Card = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background-color: ${designTokens.colorNeutral95};
  border: 1px solid ${designTokens.colorNeutral90};
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

interface CartContentProps {
  cartData: Cart | null;
  isLoading: boolean;
  onRemoveDiscount: (discountCodeId: string) => void;
  onUpdateQuantity: (lineItemId: string, newQuantity: number) => void;
  updatingLineItems: Set<string>;
}

const CartContent: React.FC<CartContentProps> = ({
  cartData,
  isLoading,
  onRemoveDiscount,
  onUpdateQuantity,
  updatingLineItems,
}) => {
  const intl = useIntl();
  const { cartAnalysis, isAnalyzing } = useCartAnalysis(cartData);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const isLineItemUpdating = (lineItemId: string) => {
    return updatingLineItems && updatingLineItems.has(lineItemId);
  };

  // Calculate discount data
  const calculateDiscountData = () => {
    if (!cartData) return { totalCartDiscounts: 0, totalProductDiscounts: 0, totalAllDiscounts: 0 };

    let totalCartDiscounts = 0;
    let totalProductDiscounts = 0;

    // Cart-level discounts
    if (cartData.discountOnTotalPrice?.discountedAmount?.centAmount) {
      totalCartDiscounts += cartData.discountOnTotalPrice.discountedAmount.centAmount;
    }

    // Line item discounts
    cartData.lineItems.forEach(item => {
      // Product discounts
      if (item.price.discounted) {
        const productDiscountPerUnit = item.price.value.centAmount - item.price.discounted.value.centAmount;
        totalProductDiscounts += productDiscountPerUnit * item.quantity;
      }

      // Cart discounts on line items
      if (item.discountedPricePerQuantity && item.discountedPricePerQuantity.length > 0) {
        item.discountedPricePerQuantity.forEach(priceQuantity => {
          if (priceQuantity.discountedPrice.includedDiscounts) {
            priceQuantity.discountedPrice.includedDiscounts.forEach(discount => {
              totalCartDiscounts += discount.discountedAmount.centAmount * priceQuantity.quantity;
            });
          }
        });
      }
    });

    return {
      totalCartDiscounts,
      totalProductDiscounts,
      totalAllDiscounts: totalCartDiscounts + totalProductDiscounts,
    };
  };

  if (isLoading || isAnalyzing) {
    return (
      <Container>
        <Header>{intl.formatMessage(messages.headerTitle)}</Header>
        <LoadingContainer>
          <LoadingSpinner scale="l">{intl.formatMessage(messages.loadingCart)}</LoadingSpinner>
        </LoadingContainer>
      </Container>
    );
  }

  if (!cartData) {
    return (
      <Container>
        <Header>{intl.formatMessage(messages.headerTitle)}</Header>
        <EmptyState>
          <Text.Body>{intl.formatMessage(messages.emptyCart)}</Text.Body>
        </EmptyState>
      </Container>
    );
  }

  const discountData = calculateDiscountData();
  const subtotalWithoutDiscounts = cartData.totalPrice.centAmount + discountData.totalAllDiscounts;

  return (
    <Container>
      <Header>{intl.formatMessage(messages.headerTitle)}</Header>
      <ContentArea>
        {/* Line Items */}
        <Card>
          {cartData.lineItems.map((item) => (
            <LineItemCard
              key={item.id}
              item={item}
              isUpdating={isLineItemUpdating(item.id)}
              onUpdateQuantity={onUpdateQuantity}
              formatCurrency={formatCurrency}
            />
          ))}
        </Card>

        {/* Potential Discounts */}
        {cartAnalysis && cartAnalysis.discountAnalysis && (
          <PotentialDiscountsSection discountAnalysis={cartAnalysis.discountAnalysis} />
        )}

        {/* Discount Analysis */}
        {cartAnalysis && cartAnalysis.discountAnalysis && (
          <DiscountAnalysisSection discountAnalysis={cartAnalysis.discountAnalysis} />
        )}

        {/* Customer Applied Discounts */}
        <AppliedDiscountsSection
          cartData={cartData}
          onRemoveDiscount={onRemoveDiscount}
        />

        {/* Cart Totals */}
        <CartTotalsSection
          subtotalWithoutDiscounts={subtotalWithoutDiscounts}
          totalAllDiscounts={discountData.totalAllDiscounts}
          cartTotal={cartData.totalPrice.centAmount}
          currencyCode={cartData.totalPrice.currencyCode}
          formatCurrency={formatCurrency}
        />
      </ContentArea>
    </Container>
  );
};

CartContent.displayName = 'CartContent';

export default CartContent;
