import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import { useIntl } from 'react-intl';
import messages from './messages';
import { useMoney } from '../../hooks/use-localization';
import { Money } from '@commercetools/platform-sdk';
import Card from '@commercetools-uikit/card';
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
  subtotalWithoutDiscounts: Money| null;
  totalAllDiscounts: Money| null;
  cartTotal: Money| null;
}

const CartTotalsSection: React.FC<CartTotalsSectionProps> = ({
  subtotalWithoutDiscounts,
  totalAllDiscounts,
  cartTotal,
}) => {
  const intl = useIntl();
  const { convertMoneytoString } = useMoney();

  return (
    <Card>
      <TotalRow className="subtotal">
        <span>{intl.formatMessage(messages.subtotalWithoutDiscounts)}</span>
        <span>{convertMoneytoString(subtotalWithoutDiscounts)}</span>
      </TotalRow>
      <TotalRow className="discount">
        <span>{intl.formatMessage(messages.totalDiscount)}</span>
        <span>-{convertMoneytoString(totalAllDiscounts)}</span>
      </TotalRow>
      <TotalRow className="total">
        <span>{intl.formatMessage(messages.cartTotal)}</span>
        <span>{convertMoneytoString(cartTotal)}</span>
      </TotalRow>
    </Card>
  );
};

CartTotalsSection.displayName = 'CartTotalsSection';

export default CartTotalsSection;

