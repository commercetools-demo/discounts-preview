import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { PromotionWithValue } from '../../hooks/use-promotions';
import messages from './messages';

const Card = styled.div`
  background-color: ${designTokens.colorSurface};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-top: 16px;
`;

const Section = styled.div`
  margin-top: 12px;
  padding-top: 12px;

  &:first-child {
    margin-top: 0;
    padding-top: 0;
  }
`;

const SectionTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${designTokens.colorNeutral60};
`;

const DiscountItem = styled.p`
  font-size: 12px;
  margin: 4px 0;
  color: ${designTokens.colorNeutral60};

  span {
    font-weight: 600;
    color: ${designTokens.colorNeutral60};
  }
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  margin-top: 8px;
  border-top: 1px solid ${designTokens.colorNeutral90};
  font-size: 14px;
  font-weight: 600;
  background-color: ${designTokens.colorNeutral95};
  padding: 8px;
  border-radius: 4px;

  span {
    font-weight: 700;
    color: ${designTokens.colorPrimary};
  }
`;

const Table = styled.table`
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
  margin-top: 8px;
`;

const TableHeader = styled.th`
  padding: 8px;
  text-align: left;
  background-color: ${designTokens.colorNeutral95};
  color: ${designTokens.colorNeutral60};
  font-weight: 600;

  &:last-child {
    text-align: right;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid ${designTokens.colorNeutral90};
  color: ${designTokens.colorNeutral60};

  &:last-child {
    text-align: right;
    font-weight: 600;
    color: ${designTokens.colorNeutral60};
  }
`;

const TableFooter = styled.tfoot`
  font-weight: 600;
  
  td {
    padding: 12px 8px;
    border-top: 2px solid ${designTokens.colorNeutral};
    background-color: ${designTokens.colorNeutral95};
    
    &:first-child {
      color: ${designTokens.colorSolid};
    }
    
    &:last-child {
      color: ${designTokens.colorPrimary};
    }
  }
`;

interface PromotionBreakdownProps {
  promo: PromotionWithValue;
  currencyCode: string;
  formatCurrency: (amount: number, currency: string) => string;
}

const PromotionBreakdown: React.FC<PromotionBreakdownProps> = ({
  promo,
  currencyCode,
  formatCurrency,
}) => {
  const intl = useIntl();

  return (
    <Card>
      {/* Cart Level Discounts */}
      {promo.includedDiscounts && promo.includedDiscounts.length > 0 && (
        <Section>
          <SectionTitle>{intl.formatMessage(messages.discountsOnCartTotal)}</SectionTitle>
          {promo.includedDiscounts.map((discount, idx) => (
            <DiscountItem key={idx}>
              {discount.name}: <span>{formatCurrency(discount.amount, currencyCode)}</span>
            </DiscountItem>
          ))}
          <Total>
            <span>{intl.formatMessage(messages.cartDiscountsTotal)}</span>
            <span>
              {formatCurrency(
                promo.includedDiscounts.reduce((sum, d) => sum + d.amount, 0),
                currencyCode
              )}
            </span>
          </Total>
        </Section>
      )}

      {/* Product Level Discounts */}
      <Section>
        <SectionTitle>{intl.formatMessage(messages.cartDiscountsOnProductLevel)}</SectionTitle>
        {promo.includedItemLevelDiscounts && promo.includedItemLevelDiscounts.length > 0 ? (
          <>
            <Table>
              <thead>
                <tr>
                  <TableHeader>{intl.formatMessage(messages.sku)}</TableHeader>
                  <TableHeader>{intl.formatMessage(messages.discountName)}</TableHeader>
                  <TableHeader>{intl.formatMessage(messages.discountValue)}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {promo.includedItemLevelDiscounts.map((discount, idx) => (
                  <tr key={idx}>
                    <TableCell>{discount.skuName}</TableCell>
                    <TableCell>{discount.name}</TableCell>
                    <TableCell>{formatCurrency(discount.amount, currencyCode)}</TableCell>
                  </tr>
                ))}
              </tbody>
              <TableFooter>
                <tr>
                  <td colSpan={2}>{intl.formatMessage(messages.productDiscountsTotal)}</td>
                  <td>
                    {formatCurrency(
                      promo.includedItemLevelDiscounts.reduce((sum, d) => sum + d.amount, 0),
                      currencyCode
                    )}
                  </td>
                </tr>
              </TableFooter>
            </Table>
          </>
        ) : (
          <div style={{ fontStyle: 'italic' }}>
            <Text.Detail>{intl.formatMessage(messages.noProductLevelDiscounts)}</Text.Detail>
          </div>
        )}
      </Section>
    </Card>
  );
};

PromotionBreakdown.displayName = 'PromotionBreakdown';

export default PromotionBreakdown;

