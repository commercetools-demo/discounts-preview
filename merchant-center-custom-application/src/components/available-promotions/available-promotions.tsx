import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { PageNavigator } from '@commercetools-uikit/pagination';
import Text from '@commercetools-uikit/text';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useCurrentCart, usePromotionContext } from '../../contexts';
import { PromotionWithValue, usePromotions } from '../../hooks/use-promotions';
import messages from './messages';
import PromotionCard from './promotion-card';
import Tooltip from '@commercetools-uikit/tooltip';
import FlatButton from '@commercetools-uikit/flat-button';

const InfoContent = styled.div`
  width: 380px;
  white-space: normal;
  padding: 12px 16px;
  background-color: ${designTokens.colorInfo95};
  border-bottom: 1px solid ${designTokens.colorNeutral90};
`;

const ContentArea = styled.div`
  width: 100%;
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

const StyledDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  padding-bottom: 20px;
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledNotApplicableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 15px;
`;

const collapsiblePanelStyles = css`
  padding-left: 20px;
  padding-right: 20px;
`;
const AvailablePromotions: React.FC = () => {
  const intl = useIntl();
  const { currentCart, applyBestPromo, applyDiscountCode } = useCurrentCart();
  const { promotions, isLoading, page, totalPages, onPageChange } =
    usePromotionContext();
  const { calculatePromotionValues } = usePromotions();
  const [promotionsWithValues, setPromotionsWithValues] = useState<
    PromotionWithValue[]
  >([]);
  useEffect(() => {
    if (!currentCart) return;
    calculatePromotionValues(promotions, currentCart).then(
      (promotionsWithValues) => {
        setPromotionsWithValues(promotionsWithValues);
        if (applyBestPromo) {
          const bestPromo = promotionsWithValues.find(
            (promo) => promo.isApplicable
          );
          if (bestPromo) {
            applyDiscountCode(bestPromo.code);
          }
        }
      }
    );
  }, [promotions, currentCart]);

  return (
    <CollapsiblePanel
      header={intl.formatMessage(messages.headerTitle)}
      // description={intl.formatMessage(messages.subHeader)}
      tone="primary"
      css={collapsiblePanelStyles}
      headerControls={
        <Tooltip
          title={intl.formatMessage(messages.infoTitle)}
          components={{
            BodyComponent: () => (
              <InfoContent>
                <div>
                  <Text.Detail>
                    {intl.formatMessage(messages.infoDescription1)}
                  </Text.Detail>
                  <div style={{ marginTop: '8px' }}>
                    <Text.Detail>
                      {intl.formatMessage(messages.infoDescription2)}
                    </Text.Detail>
                  </div>
                </div>
              </InfoContent>
            ),
          }}
        >
          <FlatButton label={intl.formatMessage(messages.infoTitle)} />
        </Tooltip>
      }
    >
      <ContentArea>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner scale="l">
              {intl.formatMessage(messages.loadingDiscounts)}
            </LoadingSpinner>
          </LoadingContainer>
        ) : promotionsWithValues.length === 0 ? (
          <EmptyState>
            <Text.Body>
              {intl.formatMessage(messages.noDiscountsAvailable)}
            </Text.Body>
          </EmptyState>
        ) : (
          <StyledWrapper>
            {promotionsWithValues
              .filter((promo) => promo.isApplicable)
              .map((promo, index) => (
                <PromotionCard
                  key={promo.id}
                  promo={promo}
                  isBestDeal={index === 0}
                />
              ))}
            <CollapsiblePanel
              header={intl.formatMessage(messages.notApplicablePromotions)}
              isDefaultClosed
            >
              <StyledNotApplicableWrapper>
                {promotionsWithValues
                  .filter((promo) => !promo.isApplicable)
                  .map((promo, index) => (
                    <PromotionCard
                      key={promo.id}
                      promo={promo}
                      isBestDeal={index === 0}
                    />
                  ))}
              </StyledNotApplicableWrapper>
            </CollapsiblePanel>
            <StyledDiv>
              <PageNavigator
                page={page}
                onPageChange={onPageChange}
                totalPages={totalPages}
              />
            </StyledDiv>
          </StyledWrapper>
        )}
      </ContentArea>
    </CollapsiblePanel>
  );
};

AvailablePromotions.displayName = 'AvailablePromotions';

export default AvailablePromotions;
