import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import { useIntl } from 'react-intl';
import type { CartDiscount } from '@commercetools/platform-sdk';
import messages from './messages';

const Card = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  border-bottom: 1px solid ${designTokens.colorNeutral90};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${designTokens.colorSolid};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Predicate = styled.p`
  font-size: 12px;
  font-family: monospace;
  color: ${designTokens.colorNeutral60};
  margin: 0 0 12px 0;
  padding: 8px;
  background-color: ${designTokens.colorNeutral95};
  border-radius: 4px;
  overflow-x: auto;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ variant: 'active' | 'inactive' | 'stackable' | 'not-stackable' }>`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${props => {
    switch (props.variant) {
      case 'active': return designTokens.colorPrimary;
      case 'inactive': return designTokens.colorError;
      case 'stackable': return designTokens.colorPrimary;
      case 'not-stackable': return designTokens.colorNeutral60;
      default: return designTokens.colorNeutral60;
    }
  }};
  background-color: ${props => {
    switch (props.variant) {
      case 'active': return designTokens.colorPrimary95;
      case 'inactive': return designTokens.colorError95;
      case 'stackable': return designTokens.colorPrimary95;
      case 'not-stackable': return designTokens.colorNeutral90;
      default: return designTokens.colorNeutral95;
    }
  }};
`;

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
  </svg>
);

const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

interface DiscountCardProps {
  discount: CartDiscount;
}

const DiscountCard: React.FC<DiscountCardProps> = ({ discount }) => {
  const intl = useIntl();
  const discountName = (discount.name && (discount.name.en || discount.name['en-US'] || discount.name['en-AU'])) || 
                       intl.formatMessage(messages.unnamedPromotion);

  return (
    <Card>
      <Name>{discountName}</Name>
      <Predicate>{discount.cartPredicate}</Predicate>
      <BadgeContainer>
        {discount.isActive ? (
          <Badge variant="active">
            <CheckIcon />
            {intl.formatMessage(messages.active)}
          </Badge>
        ) : (
          <Badge variant="inactive">
            <CrossIcon />
            {intl.formatMessage(messages.inactive)}
          </Badge>
        )}
        <Badge variant={discount.stackingMode === 'Stacking' ? 'stackable' : 'not-stackable'}>
          {discount.stackingMode === 'Stacking' ? <PlusIcon /> : <MinusIcon />}
          {intl.formatMessage(messages.stackable)}
        </Badge>
      </BadgeContainer>
    </Card>
  );
};

DiscountCard.displayName = 'DiscountCard';

export default DiscountCard;

