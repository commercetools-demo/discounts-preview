import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectInput from '@commercetools-uikit/select-input';
import { RefreshIcon } from '@commercetools-uikit/icons';
import { useIntl } from 'react-intl';
import { useCurrentCart, useCurrentCustomer } from '../../contexts';
import Link from '@commercetools-uikit/link';

import messages from './messages';
import { useMoney } from '../../hooks/use-localization';
import Spacings from '@commercetools-uikit/spacings';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

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
  width: 500px;
  min-width: 300px;
`;

const CheckboxContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const StyledNoWrap = styled.div`
  white-space: nowrap;
`;

const CartIdForm: React.FC = () => {
  const intl = useIntl();
  const { convertMoneytoString } = useMoney();
  const context = useApplicationContext((context) => context);
  const { currentCustomer, setCurrentCustomer } = useCurrentCustomer();
  const { currentCart, setCurrentCart, carts } = useCurrentCart();
  const [applyBestPromo, setApplyBestPromo] = useState(false);

  const { customers, isLoading } = useCurrentCustomer();

  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: `${customer.firstName} ${customer.lastName} (${
        customer.email || customer.id
      })`,
    }));
  }, [customers]);

  const cartOptions = useMemo(() => {
    return carts?.map((cart) => ({
      value: cart.id,
      label: `${intl.formatMessage(messages.cartQuantity, {
        quantity: cart.totalLineItemQuantity,
      })} - ${convertMoneytoString(cart.totalPrice)} (${cart.id.slice(
        0,
        4
      )}...)`,
    }));
  }, [carts]);

  const handleCustomerSelect = (event: any) => {
    const customerId = event.target.value;
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setCurrentCustomer(customer);
      }
    } else {
      setCurrentCustomer(null);
      setCurrentCart(null);
    }
  };

  const handleCartSelect = (event: any) => {
    const cartId = event.target.value;
    const cart = carts?.find((c) => c.id === cartId);
    if (cart) {
      setCurrentCart(cart);
    } else {
      setCurrentCart(null);
    }
  };

  const handleRefresh = () => {
    if (currentCustomer) {
      // onSubmit(selectedCustomer.id, applyBestPromo);
    }
  };

  return (
    <FormContainer>
      <FormContent>
        <SearchInputContainer>
          <SelectInput
            name="customer-select"
            isClearable
            value={(currentCustomer?.id ?? '') as any}
            onChange={handleCustomerSelect}
            options={customerOptions}
            placeholder={intl.formatMessage(messages.selectCustomer)}
            isDisabled={isLoading}
            horizontalConstraint="scale"
          />
        </SearchInputContainer>

        <SearchInputContainer>
          <Spacings.Inline scale="m" alignItems="center">
            <SelectInput
              name="cart-select"
              isClearable
              value={(currentCart?.id ?? '') as any}
              onChange={handleCartSelect}
              options={cartOptions}
              placeholder={intl.formatMessage(messages.selectCart)}
              isDisabled={!currentCustomer}
              horizontalConstraint="scale"
            />
            {!!currentCart && (
              <StyledNoWrap>
                <Link
                  to={`${context?.project?.key}/orders/carts/${currentCart?.id}`}
                  isExternal
                >
                  {intl.formatMessage(messages.viewCart)}
                </Link>
              </StyledNoWrap>
            )}
          </Spacings.Inline>
        </SearchInputContainer>

        <SecondaryButton
          iconLeft={<RefreshIcon />}
          label={intl.formatMessage(messages.refresh)}
          onClick={handleRefresh}
          isDisabled={!currentCustomer}
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
