import Card from '@commercetools-uikit/card';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import {
  CheckActiveIcon,
  ClockIcon,
  InfoIcon,
} from '@commercetools-uikit/icons';
import Stamp from '@commercetools-uikit/stamp';
import Text from '@commercetools-uikit/text';
import styled from '@emotion/styled';
import React from 'react';
import { useIntl } from 'react-intl';
import type { DiscountAnalysis } from '../../hooks/use-cart-analysis';
import { useLocalizedString } from '../../hooks/use-localization';
import messages from './messages';

const DiscountItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
`;

interface DiscountAnalysisSectionProps {
  discountAnalysis: DiscountAnalysis[];
}

const DiscountAnalysisSection: React.FC<DiscountAnalysisSectionProps> = ({
  discountAnalysis,
}) => {
  const intl = useIntl();
  const { convertLocalizedString } = useLocalizedString();

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
      <Text.Headline as="h3" tone="primary">
        {intl.formatMessage(messages.discountAnalysis)}
      </Text.Headline>
      <div style={{ marginTop: '16px' }}>
        {/* Qualified Discounts */}
        <CollapsiblePanel
          header={intl.formatMessage(messages.qualifiedDiscounts, {
            count: qualifiedCount,
          })}
          isDefaultClosed
        >
          {/* <CollapsibleHeader
            expanded={expandedSections.qualified}
            onClick={() => toggleSection('qualified')}
          >
            <Text.Body fontWeight="bold">
              {intl.formatMessage(messages.qualifiedDiscounts, {
                count: qualifiedCount,
              })}
            </Text.Body>
            {expandedSections.qualified ? <AngleUpIcon /> : <AngleDownIcon />}
          </CollapsibleHeader> */}
          {/* {expandedSections.qualified && (
            <CollapsibleContent> */}
          {discountAnalysis
            .filter((a) => a.qualificationStatus === 'QUALIFIED')
            .map((analysis, idx) => (
              <DiscountItem key={idx}>
                <div>
                  <Text.Body fontWeight="bold">
                    {convertLocalizedString(analysis.discount.name)}
                  </Text.Body>
                  {analysis.discount.description && (
                    <Text.Detail>
                      {convertLocalizedString(analysis.discount.description)}
                    </Text.Detail>
                  )}
                </div>
                <Stamp
                  tone="positive"
                  icon={<CheckActiveIcon />}
                  label={intl.formatMessage(messages.applied)}
                />
              </DiscountItem>
            ))}
          {/* </CollapsibleContent>
          )} */}
        </CollapsiblePanel>

        {/* Pending Discounts */}
        <CollapsiblePanel
          header={intl.formatMessage(messages.potentialDiscountsSection, {
            count: pendingCount,
          })}
          isDefaultClosed
        >
          {/* <CollapsibleHeader
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
            <CollapsibleContent> */}
          {discountAnalysis
            .filter((a) => a.qualificationStatus === 'PENDING')
            .map((analysis, idx) => (
              <DiscountItem key={idx}>
                <div>
                  <Text.Body fontWeight="bold">
                    {convertLocalizedString(analysis.discount.name)}
                  </Text.Body>
                  <Text.Detail>{analysis.qualificationMessage}</Text.Detail>
                </div>
                <Stamp
                  tone="warning"
                  icon={<ClockIcon />}
                  label={intl.formatMessage(messages.pending)}
                />
              </DiscountItem>
            ))}
          {/* </CollapsibleContent>
          )} */}
        </CollapsiblePanel>

        {/* Not Applicable Discounts */}
        <CollapsiblePanel
          header={intl.formatMessage(messages.otherDiscounts, {
            count: otherCount,
          })}
          isDefaultClosed
        >
          {/* <CollapsibleHeader
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
            <CollapsibleContent> */}
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
                    {convertLocalizedString(analysis.discount.name)}
                  </Text.Body>
                  <Text.Detail>
                    {analysis.qualificationMessage ||
                      'Not applicable to current cart'}
                  </Text.Detail>
                </div>
                <Stamp
                  tone="secondary"
                  icon={<InfoIcon />}
                  label={
                    analysis.qualificationStatus === 'UNKNOWN'
                      ? intl.formatMessage(messages.special)
                      : intl.formatMessage(messages.notApplicable)
                  }
                />
              </DiscountItem>
            ))}
          {/* </CollapsibleContent>
           )} */}
        </CollapsiblePanel>
      </div>
    </Card>
  );
};

DiscountAnalysisSection.displayName = 'DiscountAnalysisSection';

export default DiscountAnalysisSection;
