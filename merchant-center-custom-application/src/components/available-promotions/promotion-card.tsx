import { designTokens } from '@commercetools-uikit/design-system';
import styled from '@emotion/styled';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useCurrentCart } from '../../contexts';
import { useLocalizedString, useMoney } from '../../hooks/use-localization';
import type { PromotionWithValue } from '../../hooks/use-promotions';
import messages from './messages';
import PromotionBreakdown from './promotion-breakdown';
import Card from '@commercetools-uikit/card';
import Stamp from '@commercetools-uikit/stamp';
import {
  FlameIcon,
  CloseIcon,
  CheckActiveIcon,
  PlusThinIcon,
} from '@commercetools-uikit/icons';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import PrimaryButton from '@commercetools-uikit/primary-button';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
`;

interface PromotionCardProps {
  promo: PromotionWithValue;
  isBestDeal: boolean;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promo, isBestDeal }) => {
  const intl = useIntl();
  const { convertMoneytoString } = useMoney();
  const { convertLocalizedString } = useLocalizedString();
  const { currentCart, applyDiscountCode } = useCurrentCart();
  const promoName =
    convertLocalizedString(promo.name) ||
    intl.formatMessage(messages.unnamedPromotion);
  const promoDescription = convertLocalizedString(promo.description);

  const currencyCode =
    currentCart?.lineItems?.[0]?.price?.value?.currencyCode || 'USD';

  const isApplied = useMemo(() => {
    return currentCart?.discountCodes?.some(
      (discount) => discount.discountCode.obj?.code === promo.code
    );
  }, [currentCart, promo.code]);

  const onApplyDiscount = async (discountCode: string) => {
    await applyDiscountCode(discountCode);
  };

  return (
    <Card>
      <Spacings.Stack scale="s">
        <Header>
          <Spacings.Stack scale="s">
            <Spacings.Inline scale="s">
              <Text.Headline as="h2" tone="primary">
                {promoName}
              </Text.Headline>
              {isBestDeal && promo.isApplicable && (
                <Stamp
                  tone="positive"
                  icon={<FlameIcon />}
                  label={intl.formatMessage(messages.bestDeal)}
                ></Stamp>
              )}
            </Spacings.Inline>
            {!!promoDescription && (
              <Text.Subheadline>{promoDescription}</Text.Subheadline>
            )}
            <Text.Detail>
              {intl.formatMessage(messages.promotionCode, { code: promo.code })}
            </Text.Detail>
          </Spacings.Stack>

          <BadgeContainer>
            {promo.custom?.fields?.isAutomatic !== undefined && (
              <Stamp
                tone={
                  promo.custom.fields.isAutomatic ? 'information' : 'critical'
                }
                icon={
                  promo.custom.fields.isAutomatic ? (
                    <CheckActiveIcon />
                  ) : (
                    <CloseIcon />
                  )
                }
                label={intl.formatMessage(messages.auto)}
              ></Stamp>
            )}
            {promo.cartDiscounts &&
              promo.cartDiscounts[0] &&
              promo.cartDiscounts[0].obj && (
                <Stamp
                  tone={
                    promo.cartDiscounts[0].obj.stackingMode === 'Stacking'
                      ? 'information'
                      : 'critical'
                  }
                  icon={
                    promo.cartDiscounts[0].obj.stackingMode === 'Stacking' ? (
                      <PlusThinIcon />
                    ) : (
                      <CloseIcon />
                    )
                  }
                  label={intl.formatMessage(messages.stackable)}
                />
              )}
          </BadgeContainer>
        </Header>

        <Spacings.Inline scale="s" justifyContent="space-between">
          {promo.isApplicable && (
            <Spacings.Stack scale="s">
              <Spacings.Inline scale="s">
                <Text.Subheadline as="h5" tone="primary">
                  {intl.formatMessage(messages.cartTotal)}
                </Text.Subheadline>
                <Text.Detail>
                  {convertMoneytoString(promo.totalCart)}
                </Text.Detail>
              </Spacings.Inline>

              <Spacings.Inline scale="s">
                <Text.Subheadline as="h5" tone="primary">
                  {intl.formatMessage(messages.discountTotal)}
                </Text.Subheadline>
                <Text.Detail>
                  {convertMoneytoString(
                    promo.discountValue || {
                      centAmount: 0,
                      currencyCode: currencyCode,
                    }
                  )}
                </Text.Detail>
              </Spacings.Inline>
            </Spacings.Stack>
          )}
          {!promo.isApplicable && (
            <Text.Detail tone="critical">
              {intl.formatMessage(messages.notApplicablePromotion)}
            </Text.Detail>
          )}

          {promo.isApplicable && (
            <PrimaryButton
              label={
                isApplied
                  ? intl.formatMessage(messages.applied)
                  : intl.formatMessage(messages.applyDiscount)
              }
              isDisabled={isApplied}
              onClick={() => onApplyDiscount(promo.code)}
            />
          )}
        </Spacings.Inline>

        {promo.isApplicable && (
          <PromotionBreakdown promo={promo} currencyCode={currencyCode} />
        )}
      </Spacings.Stack>
    </Card>
  );
};

PromotionCard.displayName = 'PromotionCard';

export default PromotionCard;
