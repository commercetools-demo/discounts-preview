import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { LineItem } from '@commercetools/platform-sdk';
import messages from './messages';

const Container = styled.div`
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid ${designTokens.colorNeutral90};
`;

const Section = styled.div`
  background-color: ${designTokens.colorNeutral95};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.product-discount {
    background-color: ${designTokens.colorInfo95};
  }
`;

interface DiscountBreakdownProps {
  item: LineItem;
  formatCurrency: (amount: number, currencyCode: string) => string;
}

const DiscountBreakdown: React.FC<DiscountBreakdownProps> = ({
  item,
  formatCurrency,
}) => {
  const intl = useIntl();

  return (
    <Container>
      {/* Product Discount Section */}
      {item.price.discounted && (
        <Section className="product-discount">
          <Text.Detail fontWeight="bold">
            {intl.formatMessage(messages.productDiscount)}
          </Text.Detail>
          <Text.Detail>
            {item.price.discounted.discount.obj?.name.en || 
             item.price.discounted.discount.obj?.name['en-US'] || 
             item.price.discounted.discount.obj?.name['en-AU'] || 
             'Product Discount'}
          </Text.Detail>
          <Text.Detail>
            {intl.formatMessage(messages.perUnit, {
              price: formatCurrency(
                item.price.value.centAmount - item.price.discounted.value.centAmount,
                item.price.value.currencyCode
              )
            })}
          </Text.Detail>
          <Text.Detail>
            {intl.formatMessage(messages.totalUnits, {
              count: item.quantity,
              price: formatCurrency(
                (item.price.value.centAmount - item.price.discounted.value.centAmount) * item.quantity,
                item.price.value.currencyCode
              )
            })}
          </Text.Detail>
        </Section>
      )}

      {/* Cart Discounts Section */}
      {item.discountedPricePerQuantity && item.discountedPricePerQuantity.length > 0 ? (
        <Section>
          <Text.Detail fontWeight="bold">
            {intl.formatMessage(messages.cartDiscounts)}
          </Text.Detail>
          {item.discountedPricePerQuantity.map((priceQuantity, idx) =>
            priceQuantity.discountedPrice.includedDiscounts?.map((discount, discIdx) => (
              <div key={`${idx}-${discIdx}`}>
                <Text.Detail>
                  {discount.discount.obj?.name.en || 
                   discount.discount.obj?.name['en-US'] || 
                   discount.discount.obj?.name['en-AU'] || 
                   'Cart Discount'}
                </Text.Detail>
                <Text.Detail>
                  {intl.formatMessage(messages.perUnit, {
                    price: formatCurrency(
                      discount.discountedAmount.centAmount,
                      discount.discountedAmount.currencyCode
                    )
                  })}
                </Text.Detail>
                <Text.Detail>
                  {intl.formatMessage(messages.totalUnits, {
                    count: priceQuantity.quantity,
                    price: formatCurrency(
                      discount.discountedAmount.centAmount * priceQuantity.quantity,
                      discount.discountedAmount.currencyCode
                    )
                  })}
                </Text.Detail>
              </div>
            ))
          )}
        </Section>
      ) : (
        <Section>
          <Text.Detail fontWeight="bold">
            {intl.formatMessage(messages.cartDiscounts)}
          </Text.Detail>
          <Text.Detail tone="secondary">
            {intl.formatMessage(messages.noCartDiscounts)}
          </Text.Detail>
        </Section>
      )}
    </Container>
  );
};

DiscountBreakdown.displayName = 'DiscountBreakdown';

export default DiscountBreakdown;

