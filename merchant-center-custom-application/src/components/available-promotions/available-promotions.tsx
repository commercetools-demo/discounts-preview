import React, { useState } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { AngleDownIcon, AngleUpIcon } from '@commercetools-uikit/icons';
import { useIntl } from 'react-intl';
import type { Cart } from '@commercetools/platform-sdk';
import { usePromotions } from '../../hooks/use-promotions';
import PromotionCard from './promotion-card';
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

const InfoHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${designTokens.colorPrimary};
  color: ${designTokens.colorSurface};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${designTokens.colorPrimary40};
  }
`;

const InfoContent = styled.div`
  padding: 12px 16px;
  background-color: ${designTokens.colorInfo95};
  border-bottom: 1px solid ${designTokens.colorNeutral90};
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

interface AvailablePromotionsProps {
  cartData: Cart | null;
  onApplyDiscount: (discountCode: string) => void;
  applyBestPromoAutomatically: boolean;
  appliedDiscountCodes: string[];
}

const AvailablePromotions: React.FC<AvailablePromotionsProps> = ({
  cartData,
  onApplyDiscount,
  applyBestPromoAutomatically,
  appliedDiscountCodes,
}) => {
  const intl = useIntl();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const { promotions, isLoading, currencyCode } = usePromotions(cartData, applyBestPromoAutomatically);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Container>
      <Header>{intl.formatMessage(messages.headerTitle)}</Header>

      <InfoHeader onClick={() => setIsInfoExpanded(!isInfoExpanded)}>
        <span>{intl.formatMessage(messages.infoTitle)}</span>
        {isInfoExpanded ? <AngleUpIcon /> : <AngleDownIcon />}
      </InfoHeader>

      {isInfoExpanded && (
        <InfoContent>
          <div>
            <Text.Detail>{intl.formatMessage(messages.infoDescription1)}</Text.Detail>
            <div style={{ marginTop: '8px' }}>
              <Text.Detail>{intl.formatMessage(messages.infoDescription2)}</Text.Detail>
            </div>
          </div>
        </InfoContent>
      )}

      <ContentArea>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner scale="l">{intl.formatMessage(messages.loadingDiscounts)}</LoadingSpinner>
          </LoadingContainer>
        ) : promotions.length === 0 ? (
          <EmptyState>
            <Text.Body>{intl.formatMessage(messages.noDiscountsAvailable)}</Text.Body>
          </EmptyState>
        ) : (
          promotions.map((promo, index) => (
            <PromotionCard
              key={promo.id}
              promo={promo}
              index={index}
              currencyCode={currencyCode}
              isApplied={appliedDiscountCodes.includes(promo.code)}
              onApplyDiscount={onApplyDiscount}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </ContentArea>
    </Container>
  );
};

AvailablePromotions.displayName = 'AvailablePromotions';

export default AvailablePromotions;
