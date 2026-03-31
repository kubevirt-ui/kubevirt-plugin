import { ALL_CLUSTERS_KEY, ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { FLEET_OVERVIEW_PATH } from '@multicluster/constants';
import { Perspective, ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk';

import virtualizationIcon from './virtualization-icon';

import './perspective.scss';

export const icon: ResolvedExtension<Perspective>['properties']['icon'] = {
  default: virtualizationIcon,
};

export const getLandingPageURL: ResolvedExtension<Perspective>['properties']['landingPageURL'] =
  () => `/k8s/${ALL_NAMESPACES}/${VirtualMachineModelRef}`;

export const getVirtualizationLandingPageURL: ResolvedExtension<Perspective>['properties']['landingPageURL'] =
  () => `/k8s/virtualization-landing`;

export const getImportRedirectURL: ResolvedExtension<Perspective>['properties']['importRedirectURL'] =
  (namespace: string) => `/k8s/ns/${namespace}/${VirtualMachineModelRef}`;

export const getACMLandingPageURL: ResolvedExtension<Perspective>['properties']['landingPageURL'] =
  () => `${FLEET_OVERVIEW_PATH}/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}`;
