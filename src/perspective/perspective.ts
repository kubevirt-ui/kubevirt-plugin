import { Perspective, ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk';

import virtualizationIcon from './virtualization-icon';

import './perspective.scss';

export const icon: ResolvedExtension<Perspective>['properties']['icon'] = {
  default: virtualizationIcon,
};

export const getLandingPageURL: ResolvedExtension<Perspective>['properties']['landingPageURL'] =
  () => `/k8s/all-namespaces/virtualization-overview`;

export const getImportRedirectURL: ResolvedExtension<Perspective>['properties']['importRedirectURL'] =
  (namespace: string) => `/k8s/ns/${namespace}/virtualization-overview`;
