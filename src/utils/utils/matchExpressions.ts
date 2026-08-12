import { getLabels } from '@kubevirt-utils/resources/shared';
import {
  type K8sResourceCommon,
  type MatchExpression,
  Operator,
} from '@openshift-console/dynamic-plugin-sdk';

export const verifyMatchExpressions = (
  resource: K8sResourceCommon,
  matchExpressions: MatchExpression[],
): boolean =>
  matchExpressions?.every((expr) => {
    switch (expr.operator) {
      case Operator.Exists:
        return getLabels(resource)?.[expr.key] !== undefined;
      case Operator.DoesNotExist:
        return getLabels(resource)?.[expr.key] === undefined;
      case Operator.GreaterThan:
        return parseInt(getLabels(resource)?.[expr.key], 10) > parseInt(expr?.values[0], 10);
      case Operator.LessThan:
        return parseInt(getLabels(resource)?.[expr.key], 10) < parseInt(expr?.values[0], 10);
      case Operator.Equals:
        return getLabels(resource)?.[expr.key] === expr?.values[0];
      case Operator.NotEquals:
      case Operator.NotEqual:
        return getLabels(resource)?.[expr.key] !== expr?.values[0];
      case Operator.In:
        return expr.values.includes(getLabels(resource)?.[expr.key]);
      case Operator.NotIn:
        return !expr.values.includes(getLabels(resource)?.[expr.key]);
      default:
        return false;
    }
  });
