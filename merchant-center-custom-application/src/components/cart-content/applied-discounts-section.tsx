import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Text from '@commercetools-uikit/text';
import { BinLinearIcon } from '@commercetools-uikit/icons';
import { useIntl } from 'react-intl';
import type { Cart, Money } from '@commercetools/platform-sdk';
import messages from './messages';
import Card from '@commercetools-uikit/card';
import { useLocalizedString, useMoney } from '../../hooks/use-localization';

const Divider = styled.div`
  border-top: 1px solid ${designTokens.colorNeutral90};
  margin: 16px 0;
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

const List = styled.ul`
  padding-left: 20px;
  list-style: number;
  margin: 0;
`;

const DiscountItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 5px;
`;

const StyledDiv = styled.div`
  margin-bottom: 12px;
  padding-top: 12px;
`;

interface AppliedDiscountsSectionProps {
  cartData: Cart;
  discountData: {
    totalCartDiscounts: Money;
    totalProductDiscounts: Money;
    totalAllDiscounts: Money;
    cartDiscountMap: Map<string, { name: string; value: Money }>;
    productDiscountMap: Map<string, { name: string; value: Money }>;
  };
  onRemoveDiscount: (discountCodeId: string) => void;
}

const AppliedDiscountsSection: React.FC<AppliedDiscountsSectionProps> = ({
  cartData,
  discountData,
  onRemoveDiscount,
}) => {
  const intl = useIntl();
  const { convertLocalizedString } = useLocalizedString();
  const { convertMoneytoString } = useMoney();

  return (
    <>
      <Card>
        <Text.Headline as="h3" tone="primary">
          {intl.formatMessage(messages.customerAppliedDiscounts)}
        </Text.Headline>
        <div style={{ marginTop: '16px' }}>
          {cartData.discountCodes && cartData.discountCodes.length > 0 ? (
            cartData.discountCodes.map((discount) => (
              <DiscountItem key={discount.discountCode.id}>
                <Text.Body fontWeight="bold">
                  {intl.formatMessage(messages.discountCode, {
                    name: convertLocalizedString(
                      discount.discountCode.obj?.name
                    ),
                  })}
                </Text.Body>
                <SecondaryButton
                  iconLeft={<BinLinearIcon />}
                  label={intl.formatMessage(messages.remove)}
                  onClick={() => onRemoveDiscount(discount.discountCode.id)}
                  tone="secondary"
                />
              </DiscountItem>
            ))
          ) : (
            <EmptyState>
              <Text.Detail>
                {intl.formatMessage(messages.noDiscountsApplied)}
              </Text.Detail>
            </EmptyState>
          )}
        </div>
      </Card>
      <Card>
        {discountData.totalAllDiscounts.centAmount > 0 ? (
          <div>
            {/* Product Discounts Section */}
            {discountData.productDiscountMap.size > 0 && (
              <StyledDiv>
                <Text.Headline as="h3" tone="primary">
                  {intl.formatMessage(messages.productDiscountsTitle)}
                </Text.Headline>
                <List>
                  {Array.from(discountData.productDiscountMap.values()).map(
                    (discount, index) => (
                      <li key={index}>
                        <DiscountItemContent>
                          <Text.Body fontWeight="bold">
                            {discount.name}
                          </Text.Body>
                          <Text.Detail fontWeight="bold">
                            {convertMoneytoString(discount.value)}
                          </Text.Detail>
                        </DiscountItemContent>
                      </li>
                    )
                  )}
                </List>
                <DiscountItemContent>
                  <Text.Body tone="information">
                    {intl.formatMessage(messages.productDiscountsSubtotal)}
                  </Text.Body>
                  <Text.Detail tone="information" fontWeight="bold">
                    {convertMoneytoString(discountData.totalProductDiscounts)}
                  </Text.Detail>
                </DiscountItemContent>
              </StyledDiv>
            )}
            <Divider />

            {/* Cart Discounts Section */}
            {discountData.cartDiscountMap.size > 0 && (
              <StyledDiv>
                <Text.Headline as="h3" tone="primary">
                  {intl.formatMessage(messages.cartDiscountsTitle)}
                </Text.Headline>
                <List>
                  {Array.from(discountData.cartDiscountMap.values()).map(
                    (discount, index) => (
                      <li key={index}>
                        <DiscountItemContent>
                          <Text.Body fontWeight="bold">
                            {discount.name}
                          </Text.Body>
                          <Text.Detail fontWeight="bold">
                            {convertMoneytoString(discount.value)}
                          </Text.Detail>
                        </DiscountItemContent>
                      </li>
                    )
                  )}
                </List>
                <DiscountItemContent>
                  <Text.Body tone="information">
                    {intl.formatMessage(messages.cartDiscountsSubtotal)}
                  </Text.Body>
                  <Text.Detail tone="information" fontWeight="bold">
                    {convertMoneytoString(discountData.totalCartDiscounts)}
                  </Text.Detail>
                </DiscountItemContent>
              </StyledDiv>
            )}
            <Divider />
            {/* Total Discounts */}
            <DiscountItemContent>
              <Text.Body tone="information" fontWeight="bold">
                {intl.formatMessage(messages.totalAllDiscounts)}
              </Text.Body>
              <Text.Detail tone="information" fontWeight="bold">
                {convertMoneytoString(discountData.totalAllDiscounts)}
              </Text.Detail>
            </DiscountItemContent>
          </div>
        ) : (
          <p className="text-grey-600 tracking-normal italic p-2">
            {intl.formatMessage(messages.noDiscountsApplied)}
          </p>
        )}
      </Card>
    </>
  );
};

AppliedDiscountsSection.displayName = 'AppliedDiscountsSection';

export default AppliedDiscountsSection;
