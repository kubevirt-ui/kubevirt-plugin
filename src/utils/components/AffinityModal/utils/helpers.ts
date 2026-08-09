import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { intersectionWith } from './predicates';
import { type AffinityLabel, type AffinityRowData } from './types';

export { getRowsDataFromAffinity } from './affinityToRows';
export { get, has, intersectionWith, unionWith, withOperatorPredicate } from './predicates';
export { getAffinityFromRowsData } from './rowsToAffinity';

export const getAvailableAffinityID = (affinities: AffinityRowData[]): string => {
  const idSet = new Set(affinities.map((aff) => aff.id));
  let id = 1;
  while (idSet.has(id.toString())) {
    id++;
  }
  return id.toString();
};

export const isTermsInvalid = (terms: AffinityLabel[]): boolean =>
  terms?.some(
    ({ key, operator, values }) =>
      !key || ((operator === Operator.In || operator === Operator.NotIn) && values?.length === 0),
  );

export const getIntersectedQualifiedNodes = ({
  expressionNodes,
  expressions,
  fieldNodes,
  fields,
}: {
  expressionNodes: IoK8sApiCoreV1Node[];
  expressions: AffinityLabel[];
  fieldNodes: IoK8sApiCoreV1Node[];
  fields: AffinityLabel[];
}): IoK8sApiCoreV1Node[] => {
  if (expressions.length > 0 && fields.length > 0) {
    return intersectionWith(expressionNodes, fieldNodes);
  }
  if (expressions.length > 0) {
    return expressionNodes;
  }
  if (fields.length > 0) {
    return fieldNodes;
  }
  return [];
};
