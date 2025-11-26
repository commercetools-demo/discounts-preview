import Card from '@commercetools-uikit/card';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { useIntl } from 'react-intl';
import type {
  ProductDiscountReference,
  Money,
  CartDiscountReference,
} from '@commercetools/platform-sdk';
import { useCurrentCart } from '../../contexts';
import { useCartAnalysis } from '../../hooks/use-cart-analysis';
import AppliedDiscountsSection from './applied-discounts-section';
import CartTotalsSection from './cart-total-section';
import DiscountAnalysisSection from './discount-analysis-section';
import LineItemCard from './lineitem-card';
import messages from './messages';
import PotentialDiscountsSection from './potential-discounts-section';
import { useLocalizedString, useMoney } from '../../hooks/use-localization';

const collapsiblePanelStyles = css`
  padding-left: 20px;
  padding-right: 20px;
`;

const ContentArea = styled.div`
  padding-bottom: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const CartContent: React.FC = () => {
  const { currentCart: cartData, isLoading } = useCurrentCart();
  const { addMoney } = useMoney();
  const { convertLocalizedString } = useLocalizedString();
  const intl = useIntl();
  const { cartAnalysis, isAnalyzing } = useCartAnalysis(cartData);

  const onRemoveDiscount = (discountCodeId: string) => {
    // removeDiscountCode(discountCodeId);
  };

  // Calculate discount data
  const calculateDiscountData = (): {
    totalCartDiscounts: Money;
    totalProductDiscounts: Money;
    totalAllDiscounts: Money;
    cartDiscountMap: Map<string, { name: string; value: Money }>;
    productDiscountMap: Map<string, { name: string; value: Money }>;
  } => {
    const cartDiscountMap = new Map();
    const productDiscountMap = new Map();
    const currencyCode = cartData?.totalPrice.currencyCode || 'USD';
    const zeroMoney: Money = {
      centAmount: 0,
      currencyCode,
    };

    if (!cartData) {
      return {
        totalCartDiscounts: zeroMoney,
        totalProductDiscounts: zeroMoney,
        totalAllDiscounts: zeroMoney,
        cartDiscountMap: new Map(),
        productDiscountMap: new Map(),
      };
    }

    let totalCartDiscountsCents = 0;
    let totalProductDiscountsCents = 0;

    // Cart-level discounts
    if (cartData.discountOnTotalPrice?.discountedAmount?.centAmount) {
      totalCartDiscountsCents +=
        cartData.discountOnTotalPrice.discountedAmount.centAmount;
      cartData.discountOnTotalPrice.includedDiscounts.forEach((discount) => {
        const name =
          convertLocalizedString(
            (discount.discount as CartDiscountReference)?.obj?.name
          ) || 'Unnamed Cart Discount';
        cartDiscountMap.set(discount.discount.id, {
          name: name,
          value: discount.discountedAmount,
        });
      });
    }

    // Line item discounts
    cartData.lineItems.forEach((item) => {
      // Product discounts
      if (item.price.discounted) {
        const productDiscountPerUnit =
          item.price.value.centAmount - item.price.discounted.value.centAmount;
        totalProductDiscountsCents += productDiscountPerUnit * item.quantity;
        const discountId = item.price.discounted.discount.id;
        const discountName =
          convertLocalizedString(
            (item.price.discounted.discount as ProductDiscountReference)?.obj
              ?.name
          ) || 'Product Discount';

        if (productDiscountMap.has(discountId)) {
          productDiscountMap.set(discountId, {
            name: discountName,
            value: addMoney(productDiscountMap.get(discountId).value, {
              centAmount: totalProductDiscountsCents,
              currencyCode,
            }),
          });
        } else {
          productDiscountMap.set(discountId, {
            name: discountName,
            value: {
              centAmount: totalProductDiscountsCents,
              currencyCode,
            },
          });
        }
      }

      // Cart discounts on line items
      if (
        item.discountedPricePerQuantity &&
        item.discountedPricePerQuantity.length > 0
      ) {
        item.discountedPricePerQuantity.forEach((priceQuantity) => {
          if (priceQuantity.discountedPrice.includedDiscounts) {
            priceQuantity.discountedPrice.includedDiscounts.forEach(
              (discount) => {
                totalCartDiscountsCents +=
                  discount.discountedAmount.centAmount * priceQuantity.quantity;

                const discountId = discount.discount.id;
                const discountName =
                  convertLocalizedString(
                    (discount.discount as CartDiscountReference)?.obj?.name
                  ) || 'Cart Discount';

                if (cartDiscountMap.has(discountId)) {
                  cartDiscountMap.set(discountId, {
                    name: discountName,
                    value: addMoney(cartDiscountMap.get(discountId).value, {
                      centAmount: discount.discountedAmount.centAmount,
                      currencyCode,
                    }),
                  });
                } else {
                  cartDiscountMap.set(discountId, {
                    name: discountName,
                    value: {
                      centAmount: discount.discountedAmount.centAmount,
                      currencyCode,
                    },
                  });
                }
              }
            );
          }
        });
      }
    });

    return {
      totalCartDiscounts: {
        centAmount: totalCartDiscountsCents,
        currencyCode,
      },
      totalProductDiscounts: {
        centAmount: totalProductDiscountsCents,
        currencyCode,
      },
      totalAllDiscounts: {
        centAmount: totalCartDiscountsCents + totalProductDiscountsCents,
        currencyCode,
      },
      cartDiscountMap,
      productDiscountMap,
    };
  };

  const discountData = calculateDiscountData();
  const subtotalWithoutDiscounts = addMoney(
    cartData?.totalPrice,
    discountData.totalAllDiscounts
  );

  if (isLoading || isAnalyzing) {
    return (
      <CollapsiblePanel
        header={intl.formatMessage(messages.headerTitle)}
        css={collapsiblePanelStyles}
      >
        <LoadingContainer>
          <LoadingSpinner scale="l">
            {intl.formatMessage(messages.loadingCart)}
          </LoadingSpinner>
        </LoadingContainer>
      </CollapsiblePanel>
    );
  }

  if (!cartData) {
    return (
      <CollapsiblePanel
        header={intl.formatMessage(messages.headerTitle)}
        tone="primary"
        css={collapsiblePanelStyles}
      >
        <EmptyState>
          <Text.Body>{intl.formatMessage(messages.emptyCart)}</Text.Body>
        </EmptyState>
      </CollapsiblePanel>
    );
  }

  return (
    <CollapsiblePanel
      header={intl.formatMessage(messages.headerTitle)}
      tone="primary"
      css={collapsiblePanelStyles}
      horizontalConstraint="scale"
    >
      <ContentArea>
        {/* Line Items */}
        <Card>
          {cartData.lineItems.map((item) => (
            <LineItemCard key={item.id} item={item} />
          ))}
        </Card>

        {/* Potential Discounts */}
        {cartAnalysis && cartAnalysis.discountAnalysis && (
          <PotentialDiscountsSection
            discountAnalysis={cartAnalysis.discountAnalysis}
          />
        )}

        {/* Discount Analysis */}
        {cartAnalysis && cartAnalysis.discountAnalysis && (
          <DiscountAnalysisSection
            discountAnalysis={cartAnalysis.discountAnalysis}
          />
        )}

        {/* Customer Applied Discounts */}
        <AppliedDiscountsSection
          cartData={cartData}
          discountData={discountData}
          onRemoveDiscount={onRemoveDiscount}
        />

        {/* Cart Totals */}
        <CartTotalsSection
          subtotalWithoutDiscounts={subtotalWithoutDiscounts}
          totalAllDiscounts={discountData.totalAllDiscounts}
          cartTotal={cartData.totalPrice}
        />
      </ContentArea>
    </CollapsiblePanel>
  );
};

CartContent.displayName = 'CartContent';

export default CartContent;
