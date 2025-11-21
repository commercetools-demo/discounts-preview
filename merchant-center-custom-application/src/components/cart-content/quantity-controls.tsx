import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useIntl } from 'react-intl';
import messages from './messages';
import FlatButton from '@commercetools-uikit/flat-button';
import NumberInput from '@commercetools-uikit/number-input';

const StyledFlatButton = styled(FlatButton)`
  padding: 0 8px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${designTokens.colorNeutral60};
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${designTokens.colorNeutral};
  border-radius: 6px;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.75);
`;

const UpdatingText = styled.span`
  font-size: 12px;
  color: ${designTokens.colorPrimary};
  font-weight: 500;
`;

interface QuantityControlsProps {
  lineItemId: string;
  quantity: number;
  isUpdating: boolean;
  onUpdateQuantity: (lineItemId: string, newQuantity: number) => void;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  lineItemId,
  quantity,
  isUpdating,
  onUpdateQuantity,
}) => {
  const intl = useIntl();

  const handleIncrease = () => {
    onUpdateQuantity(lineItemId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(lineItemId, quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
    onUpdateQuantity(lineItemId, newQuantity);
  };

  return (
    <Container>
      <Label>{intl.formatMessage(messages.quantity)}</Label>
      <div style={{ position: 'relative' }}>
        <ButtonGroup>
          <StyledFlatButton
            label="−"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isUpdating}
          >
            −
          </StyledFlatButton>
          <NumberInput
            min={1}
            value={quantity}
            onChange={handleInputChange}
            isDisabled={isUpdating}
            horizontalConstraint={2}
          />
          <StyledFlatButton
            label="+"
            onClick={handleIncrease}
            disabled={isUpdating}
          >
            +
          </StyledFlatButton>
        </ButtonGroup>
        {isUpdating && (
          <LoadingOverlay>
            <LoadingSpinner scale="s" />
          </LoadingOverlay>
        )}
      </div>
      {isUpdating && (
        <UpdatingText>{intl.formatMessage(messages.updating)}</UpdatingText>
      )}
    </Container>
  );
};

QuantityControls.displayName = 'QuantityControls';

export default QuantityControls;
