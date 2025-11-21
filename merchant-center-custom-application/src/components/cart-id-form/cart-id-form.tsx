import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectInput from '@commercetools-uikit/select-input';
import { RefreshIcon } from '@commercetools-uikit/icons';
import { useIntl } from 'react-intl';
import { useCurrentCustomer } from '../../contexts';
import type { Customer } from '@commercetools/platform-sdk';
import messages from './messages';

const FormContainer = styled.div`
  background-color: ${designTokens.colorSurface};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormContent = styled.div`
  display: flex;
  align-items: center;

  gap: 24px;
  flex-wrap: wrap;
`;

const SearchInputContainer = styled.div`
  width: 400px;
  min-width: 300px;
`;

const CheckboxContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;


const CartIdForm: React.FC = () => {
  const intl = useIntl();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [applyBestPromo, setApplyBestPromo] = useState(false);

  const { customers, isLoading } = useCurrentCustomer();

  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: customer.email || customer.id,
    }));
  }, [customers]);

  const handleCustomerSelect = (event: any) => {
    const customerId = event.target.value;
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  };

  const handleRefresh = () => {
    if (selectedCustomer) {
      // onSubmit(selectedCustomer.id, applyBestPromo);
    }
  };

  return (
    <FormContainer>
      <FormContent>
        <SearchInputContainer>
          <SelectInput
            name="customer-select"
            value={(selectedCustomer?.id ?? '') as any}
            onChange={handleCustomerSelect}
            options={customerOptions}
            placeholder={intl.formatMessage(messages.selectCustomer)}
            isDisabled={isLoading}
            horizontalConstraint="scale"
          />
        </SearchInputContainer>

        <SecondaryButton
          iconLeft={<RefreshIcon />}
          label={intl.formatMessage(messages.refresh)}
          onClick={handleRefresh}
          isDisabled={!selectedCustomer}
        />

        <CheckboxContainer>
          <CheckboxInput
            value="apply-best-promo"
            isChecked={applyBestPromo}
            onChange={(event) => setApplyBestPromo(event.target.checked)}
          >
            {intl.formatMessage(messages.applyBestPromo)}
          </CheckboxInput>
        </CheckboxContainer>
      </FormContent>
    </FormContainer>
  );
};

CartIdForm.displayName = 'CartIdForm';

export default CartIdForm;

