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
        deployments: { name: string; spec: any }[];
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

export type VirtStatusItems = { Component: React.ReactNode; title: string }[];
