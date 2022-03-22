import * as React from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  APIServiceDefinition,
  ClusterServiceVersionIcon,
  ClusterServiceVersionPhase,
  CRDDescription,
  CSVConditionReason,
  InstallModeType,
  RequirementStatus,
} from '../../utils/types';

export type ClusterServiceVersionKind = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'ClusterServiceVersion';
  spec: {
    install: {
      strategy: 'Deployment';
      spec: {
        permissions: {
          serviceAccountName: string;
          rules: { apiGroups: string[]; resources: string[]; verbs: string[] }[];
        }[];
        deployments: { name: string; spec: any }[];
      };
    };
    customresourcedefinitions?: { owned?: CRDDescription[]; required?: CRDDescription[] };
    apiservicedefinitions?: { owned?: APIServiceDefinition[]; required?: APIServiceDefinition[] };
    replaces?: string;
    installModes: { type: InstallModeType; supported: boolean }[];
    displayName?: string;
    description?: string;
    provider?: { name: string };
    version?: string;
    icon?: ClusterServiceVersionIcon[];
  };
  status?: {
    phase: ClusterServiceVersionPhase;
    reason: CSVConditionReason;
    requirementStatus?: RequirementStatus[];
  };
} & K8sResourceCommon;

export type VirtStatusItems = { title: string; Component: React.ReactNode }[];
