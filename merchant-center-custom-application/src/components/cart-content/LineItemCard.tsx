import React, { useState } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { LineItem as LineItemType } from '@commercetools/platform-sdk';
import QuantityControls from './QuantityControls';
import DiscountBreakdown from './DiscountBreakdown';
import messages from './messages';

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

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: ${designTokens.colorSolid};
`;

const PriceText = styled.p`
  font-size: 14px;
  margin: 4px 0;
  color: ${designTokens.colorNeutral60};

  &.retail {
    font-weight: 600;
  }

  &.discounted {
    color: ${designTokens.colorPrimary};
    font-weight: 600;
  }
`;

const BreakdownButton = styled.button`
  font-size: 12px;
  color: ${designTokens.colorInfo};
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: ${designTokens.colorPrimary};
  }

  &:focus {
    outline: none;
  }
`;

interface LineItemCardProps {
  item: LineItemType;
  isUpdating: boolean;
  onUpdateQuantity: (lineItemId: string, newQuantity: number) => void;
  formatCurrency: (amount: number, currencyCode: string) => string;
}

const LineItemCard: React.FC<LineItemCardProps> = ({
  item,
  isUpdating,
  onUpdateQuantity,
  formatCurrency,
}) => {
  const intl = useIntl();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const retailUnitPrice = item.price.value.centAmount;
  const totalItemPrice = item.totalPrice.centAmount;
  const unitDiscountedPrice = totalItemPrice / item.quantity;
  const hasDiscount = retailUnitPrice !== unitDiscountedPrice;

  const itemName = item.name.en || item.name['en-US'] || item.name['en-AU'] || 'Product';
  const imageUrl = item.variant.images && item.variant.images.length > 0 
    ? item.variant.images[0].url 
    : null;

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

      <ItemDetails>
        <ItemName>{itemName}</ItemName>
        <PriceText className="retail">
          {intl.formatMessage(messages.retailUnitPrice, {
            price: formatCurrency(item.price.value.centAmount, item.price.value.currencyCode)
          })}
        </PriceText>
        <PriceText className="discounted">
          {hasDiscount 
            ? intl.formatMessage(messages.discountedPrice, {
                price: formatCurrency(unitDiscountedPrice, item.price.value.currencyCode)
              })
            : intl.formatMessage(messages.regularPrice, {
                price: formatCurrency(unitDiscountedPrice, item.price.value.currencyCode)
              })
          }
        </PriceText>

        <QuantityControls
          lineItemId={item.id}
          quantity={item.quantity}
          isUpdating={isUpdating}
          onUpdateQuantity={onUpdateQuantity}
        />

        {hasDiscount && (
          <>
            <PriceText style={{ marginTop: '12px' }}>
              {intl.formatMessage(messages.priceForItems, {
                count: item.quantity,
                price: formatCurrency(item.totalPrice.centAmount, item.price.value.currencyCode)
              })}
            </PriceText>
            <BreakdownButton onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}>
              {isBreakdownOpen 
                ? intl.formatMessage(messages.hideBreakdown)
                : intl.formatMessage(messages.showBreakdown)
              }
            </BreakdownButton>

            {isBreakdownOpen && (
              <DiscountBreakdown
                item={item}
                formatCurrency={formatCurrency}
              />
            )}
          </>
        )}
      </ItemDetails>
    </LineItem>
  );
};

LineItemCard.displayName = 'LineItemCard';

export default LineItemCard;

