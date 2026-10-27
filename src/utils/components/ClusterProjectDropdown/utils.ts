import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const extractName = (resource: K8sResourceCommon): string => getName(resource);

export const isUserProject = (project: K8sResourceCommon): boolean =>
  !isSystemNamespace(getName(project) ?? '');

export const identity = <T>(value: T): T => value;
