import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForResource,
  GroupVersionKind,
  K8sResourceCommon,
  K8sResourceKindReference,
} from '@openshift-console/dynamic-plugin-sdk';
import { getReference } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';

import { CustomResourceDefinitionKind } from './types/commonTypes';

const parseAPIVersion = (version: string) => {
  const parsed = /^v(\d+)(?:(alpha|beta)(\d+))?$/.exec(version);
  return parsed
    ? { majorVersion: Number(parsed[1]), qualifier: parsed[2], minorVersion: Number(parsed[3]) }
    : null;
};

export const apiVersionCompare = (v1: string, v2: string) => {
  const v1Parsed = parseAPIVersion(v1);
  const v2Parsed = parseAPIVersion(v2);

  // Check null parsed versions first
  if (!v1Parsed || !v2Parsed) {
    // If a value fails null check order it last
    if (v1Parsed) {
      return -1;
    }
    if (v2Parsed) {
      return 1;
    }
    return v1.localeCompare(v2);
  }
  // Then sort on major version with no qualifiers: v3 > v1
  if (
    v1Parsed.majorVersion !== v2Parsed.majorVersion &&
    !v1Parsed.qualifier &&
    !v2Parsed.qualifier
  ) {
    return v2Parsed.majorVersion - v1Parsed.majorVersion;
  }
  // Then sort on any version with no qualifier over a qualifier: v1 > v3alpha
  if (isEmpty(v1Parsed.qualifier) !== isEmpty(v2Parsed.qualifier)) {
    return v1Parsed.qualifier ? 1 : -1;
  }
  // Beta beats alpha: v1beta1 > v1alpha1
  const isBetaV1 = v1Parsed.qualifier === 'beta';
  const isBetaV2 = v2Parsed.qualifier === 'beta';
  if (isBetaV1 !== isBetaV2) {
    return isBetaV1 ? -1 : 1;
  }
  // Same qualifier, then numeric values win: v2beta2 > v1beta2
  if (v1Parsed.majorVersion !== v2Parsed.majorVersion) {
    return v2Parsed.majorVersion - v1Parsed.majorVersion;
  }
  // Finally compare minor version: v1beta2 > v1beta1
  return v2Parsed.minorVersion - v1Parsed.minorVersion;
};

export const getLatestVersionForCRD = (crd: CustomResourceDefinitionKind) => {
  const sorted = crd.spec.versions
    ?.filter((version) => version.served)
    ?.map(({ name }) => name)
    ?.sort(apiVersionCompare);
  return sorted[0];
};

export const getReferenceForResource = (resource: K8sResourceCommon): K8sResourceKindReference =>
  getReference(getGroupVersionKindForResource(resource));

export const groupVersionFor = (apiVersion: string) => ({
  group: apiVersion.split('/').length === 2 ? apiVersion.split('/')[0] : 'core',
  version: apiVersion.split('/').length === 2 ? apiVersion.split('/')[1] : apiVersion,
});

export const apiGroupForReference = (ref: GroupVersionKind) => ref.split('~')[0];

export const isGroupVersionKind = (ref: GroupVersionKind | string) => ref?.split('~').length === 3;

export const kindForReference = (ref: K8sResourceKindReference) =>
  isGroupVersionKind(ref) ? ref.split('~')[2] : ref;
