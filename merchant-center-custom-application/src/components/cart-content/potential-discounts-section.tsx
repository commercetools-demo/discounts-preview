import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { DiscountAnalysis } from '../../hooks/use-cart-analysis';
import messages from './messages';
import { useLocalizedString } from '../../hooks/use-localization';
import Card from '@commercetools-uikit/card';
import Stamp from '@commercetools-uikit/stamp';

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

interface PotentialDiscountsSectionProps {
  discountAnalysis: DiscountAnalysis[];
}

const PotentialDiscountsSection: React.FC<PotentialDiscountsSectionProps> = ({
  discountAnalysis,
}) => {
  const intl = useIntl();
  const { convertLocalizedString } = useLocalizedString();
  const pendingDiscounts = discountAnalysis.filter(
    (analysis) => analysis.qualificationStatus === 'PENDING'
  );

  return (
    <Card>
      <Text.Headline as="h3" tone="primary">
        {intl.formatMessage(messages.potentialDiscounts)}
      </Text.Headline>
      <div style={{ marginTop: '16px' }}>
        {pendingDiscounts.length > 0 ? (
          pendingDiscounts.map((analysis, index) => (
            <DiscountItem key={index}>
              <div>
                <Text.Body fontWeight="bold">
                  {convertLocalizedString(analysis.discount.name)}
                </Text.Body>
                <Text.Detail>{analysis.qualificationMessage}</Text.Detail>
              </div>
              <Stamp
                tone="warning"
                label={intl.formatMessage(messages.pending)}
              />
            </DiscountItem>
          ))
        ) : (
          <EmptyState>
            <Text.Detail>
              {intl.formatMessage(messages.noPotentialDiscounts)}
            </Text.Detail>
          </EmptyState>
        )}
      </div>
    </Card>
  );
};

PotentialDiscountsSection.displayName = 'PotentialDiscountsSection';

export default PotentialDiscountsSection;
