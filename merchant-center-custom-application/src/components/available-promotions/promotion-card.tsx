import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { useIntl } from 'react-intl';
import type { PromotionWithValue } from '../../hooks/use-promotions';
import PromotionBreakdown from './promotion-breakdown';
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

  &:last-child {
    margin-bottom: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${designTokens.colorSolid};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BestDealBadge = styled.span`
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  color: ${designTokens.colorSurface};
  background-color: ${designTokens.colorError};
`;

const Description = styled.p`
  font-size: 14px;
  color: ${designTokens.colorNeutral60};
  margin: 0;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const Badge = styled.span<{ variant: 'auto' | 'stackable' | 'manual' }>`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => {
    switch (props.variant) {
      case 'auto':
        return designTokens.colorPrimary;
      case 'stackable':
        return designTokens.colorPrimary;
      case 'manual':
        return designTokens.colorError;
      default:
        return designTokens.colorNeutral60;
    }
  }};
  background-color: ${(props) => {
    switch (props.variant) {
      case 'auto':
        return designTokens.colorPrimary95;
      case 'stackable':
        return designTokens.colorPrimary95;
      case 'manual':
        return designTokens.colorError95;
      default:
        return designTokens.colorNeutral95;
    }
  }};
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const PriceInfo = styled.div`
  flex: 1;
`;

const PriceRow = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin: 4px 0;
  color: ${designTokens.colorNeutral60};

  span {
    font-weight: 700;
  }

  &.discount span {
    color: ${designTokens.colorPrimary};
  }
`;

interface PromotionCardProps {
  promo: PromotionWithValue;
  index: number;
  currencyCode: string;
  isApplied: boolean;
  onApplyDiscount: (code: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promo,
  index,
  currencyCode,
  isApplied,
  onApplyDiscount,
  formatCurrency,
}) => {
  const intl = useIntl();
  const promoName =
    (promo.name &&
      (promo.name.en || promo.name['en-US'] || promo.name['en-AU'])) ||
    intl.formatMessage(messages.unnamedPromotion);
  const promoDescription =
    (promo.description &&
      (promo.description.en ||
        promo.description['en-US'] ||
        promo.description['en-AU'])) ||
    '';

  return (
    <Card>
      <Header>
        <TitleSection>
          <Title>
            {promoName}
            {index === 0 && (
              <BestDealBadge>
                {intl.formatMessage(messages.bestDeal)}
              </BestDealBadge>
            )}
          </Title>
          <Description>{promoDescription}</Description>
        </TitleSection>

        <BadgeContainer>
          {promo.custom?.fields?.isAutomatic !== undefined && (
            <Badge
              variant={promo.custom.fields.isAutomatic ? 'auto' : 'manual'}
            >
              {promo.custom.fields.isAutomatic ? '✓' : '✗'}{' '}
              {intl.formatMessage(messages.auto)}
            </Badge>
          )}
          {promo.cartDiscounts &&
            promo.cartDiscounts[0] &&
            promo.cartDiscounts[0].obj && (
              <Badge
                variant={
                  promo.cartDiscounts[0].obj.stackingMode === 'Stacking'
                    ? 'stackable'
                    : 'manual'
                }
              >
                {promo.cartDiscounts[0].obj.stackingMode === 'Stacking'
                  ? '+'
                  : '−'}{' '}
                {intl.formatMessage(messages.stackable)}
              </Badge>
            )}
        </BadgeContainer>
      </Header>

      <Details>
        <PriceInfo>
          <PriceRow>
            {intl.formatMessage(messages.cartTotal, {
              amount: formatCurrency(promo.totalCart, currencyCode),
            })}
          </PriceRow>
          <PriceRow className="discount">
            {intl.formatMessage(messages.discountTotal, {
              amount: formatCurrency(promo.discountValue, currencyCode),
            })}
          </PriceRow>
        </PriceInfo>

        <div>
          {isApplied ? (
            <SecondaryButton
              label={intl.formatMessage(messages.applied)}
              isDisabled={true}
            />
          ) : (
            <PrimaryButton
              label={intl.formatMessage(messages.applyDiscount)}
              onClick={() => onApplyDiscount(promo.code)}
            />
          )}
        </div>
      </Details>

      <PromotionBreakdown
        promo={promo}
        currencyCode={currencyCode}
        formatCurrency={formatCurrency}
      />
    </Card>
  );
};

PromotionCard.displayName = 'PromotionCard';

export default PromotionCard;
