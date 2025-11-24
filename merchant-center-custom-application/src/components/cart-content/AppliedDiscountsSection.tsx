import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Text from '@commercetools-uikit/text';
import { BinLinearIcon } from '@commercetools-uikit/icons';
import { useIntl } from 'react-intl';
import type { Cart } from '@commercetools/platform-sdk';
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

const SectionHeader = styled.h3`
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  margin: 0;
  background-color: ${designTokens.colorNeutral95};
  color: ${designTokens.colorPrimary};
  border-bottom: 2px solid ${designTokens.colorPrimary25};
`;

const DiscountItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: ${designTokens.colorSurface};
  border-radius: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EmptyState = styled.div`
  padding: 8px;
  font-style: italic;
`;

interface AppliedDiscountsSectionProps {
  cartData: Cart;
  onRemoveDiscount: (discountCodeId: string) => void;
}

const AppliedDiscountsSection: React.FC<AppliedDiscountsSectionProps> = ({
  cartData,
  onRemoveDiscount,
}) => {
  const intl = useIntl();

  return (
    <Card>
      <SectionHeader>{intl.formatMessage(messages.customerAppliedDiscounts)}</SectionHeader>
      <div style={{ marginTop: '16px' }}>
        {cartData.discountCodes && cartData.discountCodes.length > 0 ? (
          cartData.discountCodes.map((discount) => (
            <DiscountItem key={discount.discountCode.id}>
              <Text.Body fontWeight="bold">{discount.discountCode.obj?.name?.en}</Text.Body>
              <SecondaryButton
                iconLeft={<BinLinearIcon />}
                label={intl.formatMessage(messages.remove)}
                onClick={() => onRemoveDiscount(discount.discountCode.id)}
                tone="critical"
              />
            </DiscountItem>
          ))
        ) : (
          <EmptyState>
            <Text.Detail>{intl.formatMessage(messages.noDiscountsApplied)}</Text.Detail>
          </EmptyState>
        )}
      </div>
    </Card>
  );
};

AppliedDiscountsSection.displayName = 'AppliedDiscountsSection';

export default AppliedDiscountsSection;

