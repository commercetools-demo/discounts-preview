//
// 'sku = 1' => .: condition
//   => 'sku': target
//   => '=': operator
//   => '1': value
//

import {
  DiscountPredicateTargetTypes,
  customLineItemFunctions,
  lineItemFunctions,
  TRootLogicalValues,
} from './constants';

type TValue = string | number | boolean;

//
// TARGET TYPES
//

type TTargetKind = typeof DiscountPredicateTargetTypes;
export type TFunctionName = [
  ...typeof lineItemFunctions,
  ...typeof customLineItemFunctions
][number];

// i.e.
// ...(sku = 1)... => target field is `sku`
// ...(custom-field.my-field = 'xyz')... target fields is nested, custom-field.my-field
// ...(address = '123')...
type TFieldTarget = {
  name: string;
  kind: TTargetKind['field'];
};

// models ...(1 = 1)... or ...(true = true)...
// target is a static value
export type TConstantTarget = {
  kind: TTargetKind['constant'];
  value?: {
    type: string;
    value: TValue;
  };
};

// target is a function
export type TFunctionTarget<T extends TConditionStage> = {
  name: TFunctionName;
  kind: TTargetKind['function'];
  args?: T extends TConditionStage.Normalized
    ? string[]
    : T extends TConditionStage.NestedWithIds
    ? TNestedRuleWithIds[]
    : TNestedRule[];
};

export type TTarget<T extends TConditionStage> =
  | TFieldTarget
  | TConstantTarget
  | TFunctionTarget<T>;

export type TNormalizedConditionTarget = TTarget<TConditionStage.Normalized>;

export function isFunctionTarget<T extends TConditionStage>(
  conditionTarget?: TTarget<T>
): conditionTarget is TFunctionTarget<T> {
  return conditionTarget?.kind === DiscountPredicateTargetTypes.function;
}

export function isConstantTarget<T extends TConditionStage>(
  conditionTarget?: TTarget<T>
): conditionTarget is TConstantTarget {
  return conditionTarget?.kind === DiscountPredicateTargetTypes.constant;
}

export function isFieldTarget<T extends TConditionStage>(
  conditionTarget?: TTarget<T>
): conditionTarget is TFieldTarget {
  return conditionTarget?.kind === DiscountPredicateTargetTypes.field;
}

//
// CONDITION TYPES
//

// conditions at final stage type has ids assigned
export enum TConditionStage {
  Nested,
  NestedWithIds,
  Normalized,
}

export enum TConditionKind {
  Condition = 'condition',
  Logical = 'logical',
}

// based on the lifecycle of the condition
// they will either have ids assigned or not
export type TBaseCondition<T> = T extends
  | TConditionStage.Normalized
  | TConditionStage.NestedWithIds
  ? { id: string; parentId?: string }
  : {};

export type TConditionCondition<T extends TConditionStage> =
  TBaseCondition<T> & {
    kind: TConditionKind.Condition;
    target?: TTarget<T>;
    value?: TValue | TValue[];
    operator?: string;
    attributeType?: string;
    valueType?: 'number' | 'string' | string;
  };

export type TParsedRawCondition = TConditionCondition<TConditionStage.Nested>;
export type TParsedConditionWithIds =
  TConditionCondition<TConditionStage.NestedWithIds>;

export type TNormalizedConditionCondition =
  TConditionCondition<TConditionStage.Normalized>;

export type TConditionLogical<T extends TConditionStage> = TBaseCondition<T> & {
  kind: TConditionKind.Logical;
  logical: 'and' | 'or';
  isNegated: boolean;
  conditions: T extends TConditionStage.Normalized
    ? string[]
    : T extends TConditionStage.NestedWithIds
    ? TNestedRuleWithIds[]
    : TNestedRule[];
};

export type TParsedRawLogical = TConditionLogical<TConditionStage.Nested>;

type TCondition<T extends TConditionStage> =
  | TBaseCondition<T>
  | TConditionCondition<T>
  | TConditionLogical<T>;

// Parser outputs a nested tree without ids
export type TNestedRule = TCondition<TConditionStage.Nested>;

// We modify the tree to add ids for relations
export type TNestedRuleWithIds = TCondition<TConditionStage.NestedWithIds>;

// We normalize the tree and remove nesting
export type TNormalizedRule = TCondition<TConditionStage.Normalized>;

export function isLogicalCondition<T extends TConditionStage>(
  condition: TCondition<T>
): condition is TConditionLogical<T> {
  return 'kind' in condition && condition.kind === TConditionKind.Logical;
}

export function isConditionCondition<T extends TConditionStage>(
  condition: TCondition<T>
): condition is TConditionCondition<T> {
  return 'kind' in condition && condition.kind === TConditionKind.Condition;
}

export type TConditionTouched = Partial<
  Record<'target' | 'operator' | 'value' | 'nestedField', boolean>
>;

export type TConditionError = Partial<
  Record<'operator' | 'value', string | Record<string, boolean>> &
    Record<'target' | 'nestedField', Record<string, boolean>>
>;

export type TPredicateConditions = {
  condition: Record<string, TNormalizedRule>;
};

// In AST Form, conditions have ids, and are normalized
export type TAst = {
  isRawTextViewMode?: false;
  rootLogicalRule: TRootLogicalValues | null;
  predicateConditions: TPredicateConditions;
  predicateRootCondition: string | null;
  type?: string;
};

export type TTextMode = {
  isRawTextViewMode: true;
};

// Used in hooks tests
export type TTestWrapperProps = {
  children: React.ReactNode;
};
