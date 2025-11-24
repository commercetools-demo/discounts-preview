import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import DiscountCard from './discount-card';
import messages from './messages';
import { useAutoDiscounts } from '../../contexts';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { css } from '@emotion/react';

const collapsiblePanelStyles = css`
  padding-left: 20px;
  padding-right: 20px;
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

const ErrorState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${designTokens.colorError};
`;

const AutoTriggeredPromotions: React.FC = () => {
  const intl = useIntl();
  const { autoDiscounts, isLoading, error } = useAutoDiscounts();

  if (error) {
    return (
      <CollapsiblePanel
        header={intl.formatMessage(messages.headerTitle)}
        tone="primary"
        css={collapsiblePanelStyles}
      >
        <ErrorState>
          <Text.Body>
            {intl.formatMessage(messages.error, { message: error })}
          </Text.Body>
        </ErrorState>
      </CollapsiblePanel>
    );
  }

  return (
    <CollapsiblePanel
      header={intl.formatMessage(messages.headerTitle)}
      description={intl.formatMessage(messages.subHeader)}
      tone="primary"
      css={collapsiblePanelStyles}
    >
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner scale="l">
            {intl.formatMessage(messages.loadingDiscounts)}
          </LoadingSpinner>
        </LoadingContainer>
      ) : autoDiscounts.length === 0 ? (
        <EmptyState>
          <Text.Body>
            {intl.formatMessage(messages.noDiscountsAvailable)}
          </Text.Body>
        </EmptyState>
      ) : (
        autoDiscounts.map((discount) => (
          <DiscountCard key={discount.id} discount={discount} />
        ))
      )}
    </CollapsiblePanel>
  );
};

AutoTriggeredPromotions.displayName = 'AutoTriggeredPromotions';

export default AutoTriggeredPromotions;
