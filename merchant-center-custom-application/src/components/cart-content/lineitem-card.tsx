import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type {
  LineItem as LineItemType,
  Money,
} from '@commercetools/platform-sdk';
import QuantityControls from './quantity-controls';
import DiscountBreakdown from './discounts-breakdown';
import messages from './messages';
import { useLocalizedString, useMoney } from '../../hooks/use-localization';
import { useCurrentCart } from '../../contexts/current-cart-context';
import Spacing from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
const LineItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${designTokens.colorNeutral90};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ImageContainer = styled.div`
  width: 80px;
  height: 80px;
  margin-right: 16px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${designTokens.colorNeutral90};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${designTokens.colorNeutral60};
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: ${designTokens.colorSolid};
`;

interface LineItemCardProps {
  item: LineItemType;
}

const LineItemCard: React.FC<LineItemCardProps> = ({ item }) => {
  const intl = useIntl();
  const { convertLocalizedString } = useLocalizedString();
  const { convertMoneytoString, divideMoney, multiplyMoney } = useMoney();
  const { updateLineItemQuantity } = useCurrentCart();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const unitDiscountedPrice = divideMoney(item.totalPrice, item.quantity);
  const retailUnitPrice = item.price.value.centAmount;
  const hasDiscount = retailUnitPrice !== unitDiscountedPrice?.centAmount;

  // Check for any type of discount - either discountedPricePerQuantity OR product discount
  const anyTypeDiscount =
    (item.discountedPricePerQuantity &&
      item.discountedPricePerQuantity.length > 0) ||
    item.price.discounted;

  const unitDiscount: Money | null = useMemo(() => {
    if (anyTypeDiscount) {
      let unitDiscountAmount = 0;

      // Product discount per unit
      if (item.price.discounted) {
        unitDiscountAmount +=
          item.price.value.centAmount - item.price.discounted.value.centAmount;
      }

      // Cart discounts per unit - FIXED: Handle multiple discount groups
      if (
        item.discountedPricePerQuantity &&
        item.discountedPricePerQuantity.length > 0
      ) {
        const cartDiscountPerUnit = item.discountedPricePerQuantity.reduce(
          (total, priceQuantity) => {
            const discountSum =
              priceQuantity.discountedPrice.includedDiscounts?.reduce(
                (sum, discount) => {
                  return sum + discount.discountedAmount.centAmount;
                },
                0
              ) || 0;
            return total + discountSum;
          },
          0
        );
        unitDiscountAmount += cartDiscountPerUnit;
      }

      return {
        centAmount: unitDiscountAmount,
        currencyCode: item.price.value.currencyCode,
      };
    }
    return null;
  }, [anyTypeDiscount, item.price.discounted, item.discountedPricePerQuantity]);

  const totalDiscount = useMemo(() => {
    if (unitDiscount) {
      return multiplyMoney(unitDiscount, item.quantity);
    }
    return null;
  }, [unitDiscount, item.quantity]);

  const itemName = convertLocalizedString(item.name);
  const imageUrl =
    item.variant.images && item.variant.images.length > 0
      ? item.variant.images[0].url
      : null;

  const onUpdateQuantity = (lineItemId: string, newQuantity: number) => {
    setIsUpdating(true);
    updateLineItemQuantity(lineItemId, newQuantity)
      .finally(() => {
        setIsUpdating(false);
      })
      .catch(() => {
        setIsUpdating(false);
      });
  };

  return (
    <LineItem>
      <ImageContainer>
        {imageUrl ? (
          <ProductImage src={imageUrl} alt={itemName} />
        ) : (
          <ImagePlaceholder>
            <Text.Detail>{intl.formatMessage(messages.noImage)}</Text.Detail>
          </ImagePlaceholder>
        )}
      </ImageContainer>

      <Spacing.Stack scale="m">
        <Spacing.Stack scale="xs">
          <ItemName>{itemName}</ItemName>
          <Text.Detail tone="information" fontWeight="bold">
            {intl.formatMessage(messages.retailUnitPrice, {
              price: convertMoneytoString(item.price.value),
            })}
          </Text.Detail>
          <Text.Detail
            tone={hasDiscount ? 'positive' : 'secondary'}
            fontWeight="bold"
          >
            {intl.formatMessage(
              hasDiscount ? messages.discountedPrice : messages.regularPrice,
              {
                price: convertMoneytoString(unitDiscountedPrice),
              }
            )}
          </Text.Detail>
        </Spacing.Stack>
        <QuantityControls
          lineItemId={item.id}
          quantity={item.quantity}
          isUpdating={isUpdating}
          onUpdateQuantity={onUpdateQuantity}
        />

        {anyTypeDiscount && (
          <>
            <Spacing.Stack scale="xs">
              <Text.Detail tone="primary">
                {intl.formatMessage(messages.discountedUnitPrice, {
                  price: convertMoneytoString(unitDiscountedPrice),
                })}
              </Text.Detail>
              <Text.Detail tone="positive">
                {intl.formatMessage(messages.discountPerUnit, {
                  price: convertMoneytoString(multiplyMoney(unitDiscount, -1)),
                })}
              </Text.Detail>
            </Spacing.Stack>

            {/* Total Pricing Information */}
            <Spacing.Stack scale="xs">
              <Text.Detail tone="primary">
                {intl.formatMessage(messages.priceForItems, {
                  count: item.quantity,
                  price: convertMoneytoString(item.totalPrice),
                })}
              </Text.Detail>
              <Text.Detail tone="positive">
                {intl.formatMessage(messages.totalDiscounts, {
                  price: convertMoneytoString(multiplyMoney(totalDiscount, -1)),
                })}
              </Text.Detail>
            </Spacing.Stack>
            <FlatButton
              label={
                isBreakdownOpen
                  ? intl.formatMessage(messages.hideBreakdown)
                  : intl.formatMessage(messages.showBreakdown)
              }
              onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            />

            {isBreakdownOpen && <DiscountBreakdown item={item} />}
          </>
        )}
      </Spacing.Stack>
    </LineItem>
  );
};

LineItemCard.displayName = 'LineItemCard';

export default LineItemCard;
