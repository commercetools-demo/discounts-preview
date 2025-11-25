import { DiscountPredicateTargetTypes } from './constants';
import { TNestedRule } from './types';
import { parse as predicateParser } from './generated-parser/parser';
/* AST -> String */

const coerceTarget = (value) => {
  switch (typeof value) {
    case 'object':
      /* eslint-disable  @typescript-eslint/no-use-before-define */
      return processNode(value, true);
    default: {
      const parts = value.split('.');
      if (parts.length === 1) return value;
      return parts
        .map((part) => (/-/.test(part) ? `\`${part}\`` : part))
        .join('.');
    }
  }
};

const coerceValue = (value, valueType) => {
  if (valueType === 'string') {
    return `"${value.replaceAll('"', '\\"').trim()}"`;
  }

  return value;
};

const conditionToString = (node) => {
  if (node.value === undefined)
    return `${coerceTarget(node.target)} ${node.operator}`;

  if (Array.isArray(node.value))
    return `${coerceTarget(node.target)} ${node.operator} (${node.value
      .map((value) => coerceValue(value, node.valueType))
      .join(',')})`;

  return `${coerceTarget(node.target)} ${node.operator} ${coerceValue(
    node.value,
    node.valueType
  )}`;
};

const predicateFieldToString = (node) => {
  const parts = node.name.split('.');
  if (parts.length === 1) return node.name;
  return parts.map((part) => (/-/.test(part) ? `\`${part}\`` : part)).join('.');
};

const predicateConstantToString = (node) => {
  if (node.value.type === 'string') return `"${node.value.value}"`;

  return `${node.value.value}`;
};

const functionApplicationToString = (node) => {
  const args = node.args.map((arg) => coerceTarget(arg));

  return `${node.name}(${args.join(', ')})`;
};

const processNode = (node, isRoot = false) => {
  if (node.kind === 'condition') {
    return conditionToString(node);
  }
  if (node.kind === DiscountPredicateTargetTypes.field) {
    return predicateFieldToString(node);
  }
  if (node.kind === DiscountPredicateTargetTypes.constant) {
    return predicateConstantToString(node);
  }
  if (node.kind === DiscountPredicateTargetTypes.function) {
    return functionApplicationToString(node);
  }
  if (node.kind === 'logical') {
    const conditions = node.conditions
      .map(processNode)
      .join(` ${node.logical} `);

    if (node.isNegated) return `not(${conditions})`;
    return isRoot === true ? conditions : `(${conditions})`;
  }
  if (!node.kind) return '';

  throw new Error(`Unexpected kind ${node.kind}`);
};

/* EXPORTS */

/**
 * Given a string value, returns the same value but replaces any unsupported characters
 */

export const escapeUnsupportedChars = (input: string) =>
  input.replace(/\s/g, ' ');

const defaultOptions = {
  reportError: false,
};

/**
 * Given a string value, returns the parsed result based on the defined grammar.
 * If the input is invalid, it throws an exception.
 * If reporting is set to  'true', it removes sensitive fields
 * from the predicate and posts the result to sentry.
 */
export function parse(
  input: string | undefined | null,
  { reportError } = defaultOptions
): TNestedRule | { isEmpty: true } {
  if (!input) return { isEmpty: true };

  const safeInput = escapeUnsupportedChars(input);
  try {
    return predicateParser(safeInput, {
      startRule: 'predicate',
      grammarSource: 'predicate-parser',
    });
  } catch (error) {
    // only use for development
    // if (typeof error.format === 'function') {
    //   console.log(
    //     error.format([{ source: 'predicate-parser', text: safeInput }])
    //   );
    // }
    throw error;
  }
}

/**
 * Given a string value potentially representing a predicate,
 * returns true when value is an invalid partial predicate that only has
 * a field identifier and an operator.
 */
export function isPartialDefaultPredicate(input: string | undefined): boolean {
  if (!input) return false;
  try {
    predicateParser(input, {
      startRule: 'target_and_operator',
      grammarSource: 'predicate-parser',
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Given a AST tree, returns the parsed result in a string.
 */
export function stringify(ast) {
  if (!ast || !ast.kind) return '';
  return processNode(ast, true);
}
