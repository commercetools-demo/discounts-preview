export const DiscountPredicateTargetTypes = {
  constant: 'predicateConstant',
  field: 'predicateField',
  function: 'functionApplication',
} as const;

export const customLineItemFunctions = [
  'customLineItemTotal',
  'customLineItemCount',
  'customLineItemGrossTotal',
  'customLineItemNetTotal',
];

export const lineItemFunctions = [
  'lineItemCount',
  'lineItemTotal',
  'lineItemNetTotal',
  'lineItemGrossTotal',
  'lineItemExists',
  'forAllLineItems',
];

export const RootLogical = {
  all: 'all',
  some: 'some',
} as const;
type TRootLogicalKeys = keyof typeof RootLogical;
export type TRootLogicalValues = (typeof RootLogical)[TRootLogicalKeys];
