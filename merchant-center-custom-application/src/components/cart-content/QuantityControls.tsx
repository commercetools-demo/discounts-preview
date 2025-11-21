import React from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useIntl } from 'react-intl';
import messages from './messages';

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

const Button = styled.button<{ disabled?: boolean }>`
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 600;
  background-color: ${designTokens.colorNeutral95};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.disabled ? designTokens.colorNeutral60 : designTokens.colorSolid};
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: ${designTokens.colorNeutral90};
  }

  &:active:not(:disabled) {
    background-color: ${designTokens.colorNeutral};
  }
`;

const Input = styled.input`
  width: 64px;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-left: 1px solid ${designTokens.colorNeutral};
  border-right: 1px solid ${designTokens.colorNeutral};
  background-color: ${designTokens.colorSurface};
  color: ${designTokens.colorSolid};

  &:focus {
    outline: none;
    background-color: ${designTokens.colorNeutral95};
  }

  &:disabled {
    background-color: ${designTokens.colorNeutral95};
    color: ${designTokens.colorNeutral60};
  }
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
          <Button
            onClick={handleDecrease}
            disabled={quantity <= 1 || isUpdating}
          >
            −
          </Button>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={handleInputChange}
            disabled={isUpdating}
          />
          <Button
            onClick={handleIncrease}
            disabled={isUpdating}
          >
            +
          </Button>
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

