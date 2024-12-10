import {
  K8sResourceCommon,
  MatchExpression,
  Operator,
  Selector,
} from '@openshift-console/dynamic-plugin-sdk';

import { isEmpty } from './utils';

export const createEquals = (key: string, value: string): MatchExpression => ({
  key,
  operator: Operator.Equals,
  values: [value],
});

export const matchExpressionSatisfied = (
  expression: MatchExpression,
  labels: { [key in string]: string },
): boolean => {
  switch (expression.operator) {
    case Operator.Equals:
      return labels?.[expression.key] === expression.values?.[0];
    case Operator.NotEqual:
      return labels?.[expression.key] !== expression.values?.[0];
    case Operator.NotEquals:
      return labels?.[expression.key] !== expression.values?.[0];
    case Operator.Exists:
      return !isEmpty(labels?.[expression.key]);
    case Operator.DoesNotExist:
      return isEmpty(labels?.[expression.key]);
    case Operator.GreaterThan:
      return labels?.[expression.key] > expression.values?.[0];
    case Operator.LessThan:
      return labels?.[expression.key] < expression.values?.[0];
    case Operator.In:
      return expression.values?.includes(labels?.[expression.key]);
    case Operator.NotIn:
      return !expression.values?.includes(labels?.[expression.key]);
  }
};

export const matchSelector = (resource: K8sResourceCommon, selector: Selector) => {
  const { matchExpressions, matchLabels } = selector || {};

  const requirements = Object.keys(matchLabels || {})
    .sort()
    .map((matchLabel) => createEquals(matchLabel, matchLabels[matchLabel]));

  const allExpressions = [...requirements, ...(matchExpressions || [])];

  return allExpressions.every((expression) =>
    matchExpressionSatisfied(expression, resource?.metadata?.labels),
  );
};
