import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import { useIntl } from 'react-intl';
import messages from './messages';

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

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 16px;

  &.subtotal {
    color: ${designTokens.colorNeutral60};
    font-weight: 600;
  }

  &.discount {
    color: ${designTokens.colorPrimary};
    font-weight: 700;
  }

  &.total {
    font-size: 20px;
    font-weight: 700;
    padding-top: 16px;
    border-top: 1px solid ${designTokens.colorNeutral};
    color: ${designTokens.colorSolid};
  }
`;

interface CartTotalsSectionProps {
  subtotalWithoutDiscounts: number;
  totalAllDiscounts: number;
  cartTotal: number;
  currencyCode: string;
  formatCurrency: (amount: number, currencyCode: string) => string;
}

const CartTotalsSection: React.FC<CartTotalsSectionProps> = ({
  subtotalWithoutDiscounts,
  totalAllDiscounts,
  cartTotal,
  currencyCode,
  formatCurrency,
}) => {
  const intl = useIntl();

  return (
    <Card>
      <TotalRow className="subtotal">
        <span>{intl.formatMessage(messages.subtotalWithoutDiscounts)}</span>
        <span>{formatCurrency(subtotalWithoutDiscounts, currencyCode)}</span>
      </TotalRow>
      <TotalRow className="discount">
        <span>{intl.formatMessage(messages.totalDiscount)}</span>
        <span>-{formatCurrency(totalAllDiscounts, currencyCode)}</span>
      </TotalRow>
      <TotalRow className="total">
        <span>{intl.formatMessage(messages.cartTotal)}</span>
        <span>{formatCurrency(cartTotal, currencyCode)}</span>
      </TotalRow>
    </Card>
  );
};

CartTotalsSection.displayName = 'CartTotalsSection';

export default CartTotalsSection;

