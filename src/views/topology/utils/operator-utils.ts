import { ClusterServiceVersionKind } from '../../clusteroverview/utils/types';

export type OperatorBackedServiceKindMap = {
  [name: string]: ClusterServiceVersionKind;
};

export const getOperatorBackedServiceKindMap = (
  installedOperators: ClusterServiceVersionKind[],
): OperatorBackedServiceKindMap =>
  installedOperators
    ? installedOperators.reduce((kindMap, csv) => {
        (csv?.spec?.customresourcedefinitions?.owned || []).forEach((crd) => {
          if (!(crd.kind in kindMap)) {
            kindMap[crd.kind] = csv;
          }
        });
        return kindMap;
      }, {})
    : {};
