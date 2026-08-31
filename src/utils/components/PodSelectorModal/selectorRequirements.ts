import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import {
  SELECTOR_OPERATOR_EQUALS_REGEX,
  SELECTOR_OPERATOR_GREATER_THAN_REGEX,
  SELECTOR_OPERATOR_IN_REGEX,
  SELECTOR_OPERATOR_KEY_REGEX,
  SELECTOR_OPERATOR_LESS_THAN_REGEX,
  SELECTOR_OPERATOR_NEGATED_KEY_REGEX,
  SELECTOR_OPERATOR_NOT_EQUALS_REGEX,
  SELECTOR_OPERATOR_NOT_IN_REGEX,
} from './constants';
import { type Requirement } from './types';

export const requirementFromString = (inputString: string): Requirement | undefined => {
  const string = inputString.trim();

  if (SELECTOR_OPERATOR_KEY_REGEX.test(string)) {
    return {
      key: string,
      operator: Operator.Exists,
      values: [],
    };
  }

  if (SELECTOR_OPERATOR_NEGATED_KEY_REGEX.test(string)) {
    return {
      key: string.split('!')[1].trim(),
      operator: Operator.DoesNotExist,
      values: [],
    };
  }

  if (SELECTOR_OPERATOR_EQUALS_REGEX.test(string)) {
    const [key, value] = string.split(/==?/).map((part) => part.trim());

    return {
      key,
      operator: Operator.Equals,
      values: [value],
    };
  }

  if (SELECTOR_OPERATOR_NOT_EQUALS_REGEX.test(string)) {
    const [key, value] = string.split('!=').map((part) => part.trim());

    return {
      key,
      operator: Operator.NotEquals,
      values: [value],
    };
  }

  if (SELECTOR_OPERATOR_IN_REGEX.test(string)) {
    const inKeyword = ' in ';
    const inIndex = string.search(/ in /i);
    const key = string.substring(0, inIndex).trim();
    const valuesString = string.substring(inIndex + inKeyword.length).trim();
    const values = valuesString
      .slice(1, -1)
      .split(',')
      .map((val) => val.trim());

    return {
      key,
      operator: Operator.In,
      values,
    };
  }

  if (SELECTOR_OPERATOR_NOT_IN_REGEX.test(string)) {
    const notinKeyword = ' notin ';
    const notinIndex = string.search(/ notin /i);
    const key = string.substring(0, notinIndex).trim();
    const valuesString = string.substring(notinIndex + notinKeyword.length).trim();
    const values = valuesString
      .slice(1, -1)
      .split(',')
      .map((val) => val.trim());

    return {
      key,
      operator: Operator.NotIn,
      values,
    };
  }

  if (SELECTOR_OPERATOR_GREATER_THAN_REGEX.test(string)) {
    const [key, value] = string.split('>').map((part) => part.trim());
    return {
      key,
      operator: Operator.GreaterThan,
      values: [value],
    };
  }

  if (SELECTOR_OPERATOR_LESS_THAN_REGEX.test(string)) {
    const [key, value] = string.split('<').map((part) => part.trim());
    return {
      key,
      operator: Operator.LessThan,
      values: [value],
    };
  }

  return; // falsy means parsing failure
};
