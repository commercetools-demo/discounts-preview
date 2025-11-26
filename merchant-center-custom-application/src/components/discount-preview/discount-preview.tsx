import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import styled from '@emotion/styled';
import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useCurrentCart } from '../../contexts';
import AutoTriggeredPromotions from '../auto-triggered-promotions';
import AvailablePromotions from '../available-promotions';
import CartContent from '../cart-content';
import CartIdForm from '../cart-id-form';
import messages from './messages';
import Spacings from '@commercetools-uikit/spacings';

const Container = styled.div`
  background-color: ${designTokens.colorNeutral95};
  min-height: 100vh;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: ${designTokens.colorSolid};
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  color: ${designTokens.colorError};
  text-align: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: ${designTokens.colorError95};
  border-radius: 4px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PromotionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const DiscountPreview: React.FC = () => {
  const intl = useIntl();

  const { currentCart: cartData, error } = useCurrentCart();

  return (
    <Container>
      <Spacings.Stack scale="m">
        <Header>
          <Title>{intl.formatMessage(messages.pageTitle)}</Title>
          {/* Logo would be added here if available */}
        </Header>
        <Text.Headline as="h1">
          {intl.formatMessage(messages.pageTitle)}
        </Text.Headline>

        <CartIdForm />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <GridContainer>
          <div>
            <CartContent />
          </div>
          <PromotionsContainer>
            <AvailablePromotions />
            <AutoTriggeredPromotions />
          </PromotionsContainer>
        </GridContainer>
      </Spacings.Stack>
    </Container>
  );
};

DiscountPreview.displayName = 'DiscountPreview';

export default DiscountPreview;
