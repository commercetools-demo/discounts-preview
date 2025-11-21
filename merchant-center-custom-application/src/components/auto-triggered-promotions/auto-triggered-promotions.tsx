import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import { useCartDiscounts } from '../../hooks/use-cart-discounts';
import DiscountCard from './discount-card';
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

const SubHeader = styled.p`
  font-size: 14px;
  padding: 12px 16px;
  background-color: ${designTokens.colorInfo95};
  color: ${designTokens.colorNeutral60};
  border-bottom: 1px solid ${designTokens.colorNeutral90};
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

const ErrorState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${designTokens.colorError};
`;

const AutoTriggeredPromotions: React.FC = () => {
  const intl = useIntl();
  const { discounts, isLoading, error } = useCartDiscounts();

  if (error) {
    return (
      <Container>
        <Header>{intl.formatMessage(messages.headerTitle)}</Header>
        <ErrorState>
          <Text.Body>{intl.formatMessage(messages.error, { message: error })}</Text.Body>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>{intl.formatMessage(messages.headerTitle)}</Header>
      <SubHeader>{intl.formatMessage(messages.subHeader)}</SubHeader>
      <ContentArea>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner scale="l">{intl.formatMessage(messages.loadingDiscounts)}</LoadingSpinner>
          </LoadingContainer>
        ) : discounts.length === 0 ? (
          <EmptyState>
            <Text.Body>{intl.formatMessage(messages.noDiscountsAvailable)}</Text.Body>
          </EmptyState>
        ) : (
          discounts.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))
        )}
      </ContentArea>
    </Container>
  );
};

AutoTriggeredPromotions.displayName = 'AutoTriggeredPromotions';

export default AutoTriggeredPromotions;
