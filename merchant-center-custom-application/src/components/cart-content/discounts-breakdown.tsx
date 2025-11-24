import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type {
  CartDiscountReference,
  LineItem,
} from '@commercetools/platform-sdk';
import messages from './messages';
import { useLocalizedString, useMoney } from '../../hooks/use-localization';

const Container = styled.div`
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid ${designTokens.colorNeutral90};
`;

const Section = styled.div`
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledDiscountBreakdown = styled.div`
  padding-left: 8px;
`;

interface DiscountBreakdownProps {
  item: LineItem;
}

const DiscountBreakdown: React.FC<DiscountBreakdownProps> = ({ item }) => {
  const intl = useIntl();
  const { convertMoneytoString, subtractMoney, multiplyMoney } = useMoney();
  const { convertLocalizedString } = useLocalizedString();
  return (
    <Container>
      {/* Product Discount Section */}
      {item.price.discounted && (
        <Section className="product-discount">
          <Text.Detail fontWeight="bold">
            {intl.formatMessage(messages.productDiscount)}
          </Text.Detail>
          <Text.Detail>
            {convertLocalizedString(item.price.discounted.discount?.obj?.name)}
          </Text.Detail>
          <StyledDiscountBreakdown>
            <Text.Detail>
              {intl.formatMessage(messages.perUnit, {
                price: convertMoneytoString(
                  subtractMoney(item.price.value, item.price.discounted.value)
                ),
              })}
            </Text.Detail>
            <Text.Detail>
              {intl.formatMessage(messages.totalUnits, {
                count: item.quantity,
                price: convertMoneytoString(
                  multiplyMoney(
                    subtractMoney(
                      item.price.value,
                      item.price.discounted.value
                    ),
                    item.quantity
                  )
                ),
              })}
            </Text.Detail>
          </StyledDiscountBreakdown>
        </Section>
      )}

      {/* Cart Discounts Section */}
      {item.discountedPricePerQuantity &&
      item.discountedPricePerQuantity.length > 0 ? (
        <Section>
          <Text.Detail fontWeight="bold">
            {intl.formatMessage(messages.cartDiscounts)}
          </Text.Detail>
          {item.discountedPricePerQuantity.map((priceQuantity, idx) =>
            priceQuantity.discountedPrice.includedDiscounts?.map(
              (discount, discIdx) => (
                <div key={`${idx}-${discIdx}`}>
                  <Text.Detail fontWeight="medium">
                    {convertLocalizedString(
                      (discount.discount as CartDiscountReference)?.obj?.name
                    )}
                  </Text.Detail>
                  <StyledDiscountBreakdown>
                    <Text.Detail>
                      {intl.formatMessage(messages.perUnit, {
                        price: convertMoneytoString(discount.discountedAmount),
                      })}
                    </Text.Detail>
                    <Text.Detail>
                      {intl.formatMessage(messages.totalUnits, {
                        count: priceQuantity.quantity,
                        price: convertMoneytoString(
                          multiplyMoney(
                            discount.discountedAmount,
                            priceQuantity.quantity
                          )
                        ),
                      })}
                    </Text.Detail>
                  </StyledDiscountBreakdown>
                </div>
              )
            )
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
