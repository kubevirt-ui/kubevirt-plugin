// Extracted from types.ts
// Root: src/views/clusteroverview/utils/types.ts

import { type Selector } from '@openshift-console/dynamic-plugin-sdk';

import { type K8sResourceKind } from './csvTypes';

export type OperatorGroupKind = {
  apiVersion: 'operators.coreos.com/v1';
  kind: 'OperatorGroup';
  spec?: {
    selector?: Selector;
    serviceAccount?: K8sResourceKind;
    targetNamespaces?: string[];
  };
  status?: {
    lastUpdated: string;
    namespaces?: string[];
  };
} & K8sResourceKind;
