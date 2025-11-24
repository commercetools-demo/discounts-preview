import React, { useState } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Text from '@commercetools-uikit/text';
import { AngleDownIcon, AngleUpIcon } from '@commercetools-uikit/icons';
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

const CollapsibleSection = styled.div`
  border: 1px solid ${designTokens.colorNeutral90};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const CollapsibleHeader = styled.button<{ expanded: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${(props) =>
    props.expanded ? designTokens.colorNeutral95 : designTokens.colorSurface};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${designTokens.colorNeutral95};
  }
`;

const CollapsibleContent = styled.div`
  padding: 12px 16px;
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

const Badge = styled.span<{ variant: 'success' | 'warning' | 'neutral' }>`
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  color: ${designTokens.colorSurface};
  background-color: ${(props) => {
    switch (props.variant) {
      case 'success':
        return designTokens.colorPrimary;
      case 'warning':
        return designTokens.colorWarning;
      case 'neutral':
        return designTokens.colorNeutral60;
      default:
        return designTokens.colorNeutral;
    }
  }};
`;

interface DiscountAnalysisSectionProps {
  discountAnalysis: DiscountAnalysis[];
}

const DiscountAnalysisSection: React.FC<DiscountAnalysisSectionProps> = ({
  discountAnalysis,
}) => {
  const intl = useIntl();
  const [expandedSections, setExpandedSections] = useState({
    qualified: false,
    pending: false,
    notApplicable: false,
  });

  const toggleSection = (
    section: 'qualified' | 'pending' | 'notApplicable'
  ) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const qualifiedCount = discountAnalysis.filter(
    (a) => a.qualificationStatus === 'QUALIFIED'
  ).length;
  const pendingCount = discountAnalysis.filter(
    (a) => a.qualificationStatus === 'PENDING'
  ).length;
  const otherCount = discountAnalysis.filter(
    (a) =>
      a.qualificationStatus === 'NOT_APPLICABLE' ||
      a.qualificationStatus === 'UNKNOWN'
  ).length;

  return (
    <Card>
      <SectionHeader>
        {intl.formatMessage(messages.discountAnalysis)}
      </SectionHeader>
      <div style={{ marginTop: '16px' }}>
        {/* Qualified Discounts */}
        <CollapsibleSection>
          <CollapsibleHeader
            expanded={expandedSections.qualified}
            onClick={() => toggleSection('qualified')}
          >
            <Text.Body fontWeight="bold">
              {intl.formatMessage(messages.qualifiedDiscounts, {
                count: qualifiedCount,
              })}
            </Text.Body>
            {expandedSections.qualified ? <AngleUpIcon /> : <AngleDownIcon />}
          </CollapsibleHeader>
          {expandedSections.qualified && (
            <CollapsibleContent>
              {discountAnalysis
                .filter((a) => a.qualificationStatus === 'QUALIFIED')
                .map((analysis, idx) => (
                  <DiscountItem key={idx}>
                    <div>
                      <Text.Body fontWeight="bold">
                        {analysis.discount.name}
                      </Text.Body>
                      {analysis.discount.description && (
                        <Text.Detail>
                          {analysis.discount.description}
                        </Text.Detail>
                      )}
                    </div>
                    <Badge variant="success">
                      {intl.formatMessage(messages.applied)}
                    </Badge>
                  </DiscountItem>
                ))}
            </CollapsibleContent>
          )}
        </CollapsibleSection>

        {/* Pending Discounts */}
        <CollapsibleSection>
          <CollapsibleHeader
            expanded={expandedSections.pending}
            onClick={() => toggleSection('pending')}
          >
            <Text.Body fontWeight="bold">
              {intl.formatMessage(messages.potentialDiscountsSection, {
                count: pendingCount,
              })}
            </Text.Body>
            {expandedSections.pending ? <AngleUpIcon /> : <AngleDownIcon />}
          </CollapsibleHeader>
          {expandedSections.pending && (
            <CollapsibleContent>
              {discountAnalysis
                .filter((a) => a.qualificationStatus === 'PENDING')
                .map((analysis, idx) => (
                  <DiscountItem key={idx}>
                    <div>
                      <Text.Body fontWeight="bold">
                        {analysis.discount.name}
                      </Text.Body>
                      <Text.Detail>{analysis.qualificationMessage}</Text.Detail>
                    </div>
                    <Badge variant="warning">
                      {intl.formatMessage(messages.pending)}
                    </Badge>
                  </DiscountItem>
                ))}
            </CollapsibleContent>
          )}
        </CollapsibleSection>

        {/* Not Applicable Discounts */}
        <CollapsibleSection>
          <CollapsibleHeader
            expanded={expandedSections.notApplicable}
            onClick={() => toggleSection('notApplicable')}
          >
            <Text.Body fontWeight="bold">
              {intl.formatMessage(messages.otherDiscounts, {
                count: otherCount,
              })}
            </Text.Body>
            {expandedSections.notApplicable ? (
              <AngleUpIcon />
            ) : (
              <AngleDownIcon />
            )}
          </CollapsibleHeader>
          {expandedSections.notApplicable && (
            <CollapsibleContent>
              {discountAnalysis
                .filter(
                  (a) =>
                    a.qualificationStatus === 'NOT_APPLICABLE' ||
                    a.qualificationStatus === 'UNKNOWN'
                )
                .map((analysis, idx) => (
                  <DiscountItem key={idx}>
                    <div>
                      <Text.Body fontWeight="bold">
                        {analysis.discount.name}
                      </Text.Body>
                      <Text.Detail>
                        {analysis.qualificationMessage ||
                          'Not applicable to current cart'}
                      </Text.Detail>
                    </div>
                    <Badge variant="neutral">
                      {analysis.qualificationStatus === 'UNKNOWN'
                        ? intl.formatMessage(messages.special)
                        : intl.formatMessage(messages.notApplicable)}
                    </Badge>
                  </DiscountItem>
                ))}
            </CollapsibleContent>
          )}
        </CollapsibleSection>
      </div>
    </Card>
  );
};

DiscountAnalysisSection.displayName = 'DiscountAnalysisSection';

export default DiscountAnalysisSection;
