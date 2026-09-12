import { type ReactNode } from 'react';

import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  type APIServiceDefinition,
  type ClusterServiceVersionIcon,
  type ClusterServiceVersionPhase,
  type CRDDescription,
  type CSVConditionReason,
  type InstallModeType,
  type RequirementStatus,
} from '../../../utils/types';

export type ClusterServiceVersionKind = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'ClusterServiceVersion';
  spec: {
    apiservicedefinitions?: { owned?: APIServiceDefinition[]; required?: APIServiceDefinition[] };
    customresourcedefinitions?: { owned?: CRDDescription[]; required?: CRDDescription[] };
    description?: string;
    displayName?: string;
    icon?: ClusterServiceVersionIcon[];
    install: {
      spec: {
        deployments: { name: string; spec: unknown }[];
        permissions: {
          rules: { apiGroups: string[]; resources: string[]; verbs: string[] }[];
          serviceAccountName: string;
        }[];
      };
      strategy: 'Deployment';
    };
    installModes: { supported: boolean; type: InstallModeType }[];
    provider?: { name: string };
    replaces?: string;
    version?: string;
  };
  status?: {
    phase: ClusterServiceVersionPhase;
    reason: CSVConditionReason;
    requirementStatus?: RequirementStatus[];
  };
} & K8sResourceCommon;

export type VirtStatusItems = { Component: ReactNode; title: string }[];
