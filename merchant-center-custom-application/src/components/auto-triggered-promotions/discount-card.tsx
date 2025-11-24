import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import { useIntl } from 'react-intl';
import type { CartDiscount } from '@commercetools/platform-sdk';
import messages from './messages';
import { useLocalizedString } from '../../hooks/use-localization';
import Card from '@commercetools-uikit/card';
import Text from '@commercetools-uikit/text';
import Stamp from '@commercetools-uikit/stamp';
import {
  CheckActiveIcon,
  CheckInactiveIcon,
  PlusThinIcon,
  CloseIcon,
} from '@commercetools-uikit/icons';

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
`;

interface DiscountCardProps {
  discount: CartDiscount;
}

const DiscountCard: React.FC<DiscountCardProps> = ({ discount }) => {
  const { convertLocalizedString } = useLocalizedString();
  const intl = useIntl();
  const discountName = convertLocalizedString(discount.name);

  return (
    <Card>
      <Text.Headline as="h2" tone="primary">
        {discountName}
      </Text.Headline>
      <Predicate>{discount.cartPredicate}</Predicate>
      <BadgeContainer>
        <Stamp
          tone={discount.isActive ? 'positive' : 'critical'}
          icon={discount.isActive ? <CheckActiveIcon /> : <CheckInactiveIcon />}
          label={
            discount.isActive
              ? intl.formatMessage(messages.active)
              : intl.formatMessage(messages.inactive)
          }
        ></Stamp>
        <Stamp
          tone={discount.stackingMode === 'Stacking' ? 'primary' : 'warning'}
          icon={
            discount.stackingMode === 'Stacking' ? (
              <PlusThinIcon />
            ) : (
              <CloseIcon />
            )
          }
          label={
            discount.stackingMode === 'Stacking'
              ? intl.formatMessage(messages.stackable)
              : intl.formatMessage(messages.notStackable)
          }
        ></Stamp>
      </BadgeContainer>
    </Card>
  );
};

DiscountCard.displayName = 'DiscountCard';

export default DiscountCard;
