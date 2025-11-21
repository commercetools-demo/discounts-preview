import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import type { DiscountAnalysis } from '../../hooks/use-cart-analysis';
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
`;

const SectionHeader = styled.h3`
  font-size: 16px;
  font-weight: 600;
  padding: 16px;
  margin: 0;
  background-color: ${designTokens.colorNeutral95};
  color: ${designTokens.colorPrimary};
  border-bottom: 2px solid ${designTokens.colorPrimary25};
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

const Badge = styled.span`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  color: ${designTokens.colorSurface};
  background-color: ${designTokens.colorWarning};
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
  const pendingDiscounts = discountAnalysis.filter(
    analysis => analysis.qualificationStatus === 'PENDING'
  );

  return (
    <Card>
      <SectionHeader>{intl.formatMessage(messages.potentialDiscounts)}</SectionHeader>
      <div style={{ marginTop: '16px' }}>
        {pendingDiscounts.length > 0 ? (
          pendingDiscounts.map((analysis, index) => (
            <DiscountItem key={index}>
              <div>
                <Text.Body fontWeight="bold">{analysis.discount.name}</Text.Body>
                <Text.Detail>{analysis.qualificationMessage}</Text.Detail>
              </div>
              <Badge>{intl.formatMessage(messages.pending)}</Badge>
            </DiscountItem>
          ))
        ) : (
          <EmptyState>
            <Text.Detail>{intl.formatMessage(messages.noPotentialDiscounts)}</Text.Detail>
          </EmptyState>
        )}
      </div>
    </Card>
  );
};

PotentialDiscountsSection.displayName = 'PotentialDiscountsSection';

export default PotentialDiscountsSection;

