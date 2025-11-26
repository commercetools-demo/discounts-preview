import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Discounts Preview',
  entryPointUriPath: '${env:ENTRY_POINT_URI_PATH}',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    production: {
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
    },
  },
  oAuthScopes: {
    view: ['view_products','view_customers','view_cart_discounts', 'view_discount_codes', 'view_orders'],
    manage: ['manage_cart_discounts', 'manage_discount_codes', 'manage_orders'],
  },
  icon: '${path:@tabler/icons/filled/discount.svg}',
  mainMenuLink: {
    defaultLabel: 'Discounts Preview Calculator',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: '/',
      defaultLabel: 'Discounts Preview Calculator',
      permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'overview',
      defaultLabel: 'All Discounts',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;
