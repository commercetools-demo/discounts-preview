import { defineMessages } from 'react-intl';

export default defineMessages({
  headerTitle: {
    id: 'AvailablePromotions.headerTitle',
    defaultMessage: 'Available Discounts (discount code based)',
  },
  infoTitle: {
    id: 'AvailablePromotions.infoTitle',
    defaultMessage: 'Information about discounts',
  },
  infoDescription1: {
    id: 'AvailablePromotions.infoDescription1',
    defaultMessage:
      "Discounts that are applied automatically based on the configuration 'Apply automatically' (custom field on Discount Code) or manually using 'apply discount' button. Depending on the implementation, the \"best deal\" discounts might be automatically applied on the customer cart.",
  },
  infoDescription2: {
    id: 'AvailablePromotions.infoDescription2',
    defaultMessage:
      'Your new cart total and the potential discounts including all active auto-triggered promotions if you apply this promotion. Breakdown shows how discount is applied, on total cart price or on line item level.',
  },
  loadingDiscounts: {
    id: 'AvailablePromotions.loadingDiscounts',
    defaultMessage: 'Loading discounts...',
  },
  noDiscountsAvailable: {
    id: 'AvailablePromotions.noDiscountsAvailable',
    defaultMessage: 'No discounts available.',
  },
  bestDeal: {
    id: 'AvailablePromotions.bestDeal',
    defaultMessage: 'Best Deal',
  },
  unnamedPromotion: {
    id: 'AvailablePromotions.unnamedPromotion',
    defaultMessage: 'Unnamed Promotion',
  },
  auto: {
    id: 'AvailablePromotions.auto',
    defaultMessage: 'Auto',
  },
  stackable: {
    id: 'AvailablePromotions.stackable',
    defaultMessage: 'Stackable',
  },
  cartTotal: {
    id: 'AvailablePromotions.cartTotal',
    defaultMessage: 'Cart Total: {amount}',
  },
  discountTotal: {
    id: 'AvailablePromotions.discountTotal',
    defaultMessage: 'Discount Total: {amount}',
  },
  applied: {
    id: 'AvailablePromotions.applied',
    defaultMessage: 'Applied',
  },
  applyDiscount: {
    id: 'AvailablePromotions.applyDiscount',
    defaultMessage: 'Apply Discount',
  },
  discountsOnCartTotal: {
    id: 'AvailablePromotions.discountsOnCartTotal',
    defaultMessage: 'Discounts on cart total:',
  },
  cartDiscountsTotal: {
    id: 'AvailablePromotions.cartDiscountsTotal',
    defaultMessage: 'Cart Discounts Total:',
  },
  cartDiscountsOnProductLevel: {
    id: 'AvailablePromotions.cartDiscountsOnProductLevel',
    defaultMessage: 'Cart Discounts on Product Level:',
  },
  sku: {
    id: 'AvailablePromotions.sku',
    defaultMessage: 'SKU',
  },
  discountName: {
    id: 'AvailablePromotions.discountName',
    defaultMessage: 'Discount Name',
  },
  discountValue: {
    id: 'AvailablePromotions.discountValue',
    defaultMessage: 'Discount Value',
  },
  productDiscountsTotal: {
    id: 'AvailablePromotions.productDiscountsTotal',
    defaultMessage: 'Product Discounts Total:',
  },
  noProductLevelDiscounts: {
    id: 'AvailablePromotions.noProductLevelDiscounts',
    defaultMessage: 'No product level discounts',
  },
});
