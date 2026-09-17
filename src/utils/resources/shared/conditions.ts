import { type V1beta1Condition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type K8sResourceCondition,
  type K8sResourceKind,
} from '@openshift-console/dynamic-plugin-sdk';

export const getConditionReason = (condition: V1beta1Condition): string => condition?.reason;

export const isConditionStatusTrue = (condition: V1beta1Condition): boolean =>
  condition?.status === 'True';

export type ResourceWithConditions<C = K8sResourceCondition> = {
  status?: {
    conditions?: C[];
  };
};

export const getStatusConditions = <C = K8sResourceCondition>(
  entity: ResourceWithConditions<C>,
): C[] => entity?.status?.conditions ?? [];

export const getStatusConditionsByType = <C extends { type?: string } = K8sResourceCondition>(
  entity: ResourceWithConditions<C>,
  type: string,
): C | undefined => getStatusConditions<C>(entity)?.find((condition) => condition?.type === type);

export const isStatusConditionTrue = <
  C extends { status?: string; type?: string } = K8sResourceCondition,
>(
  entity: ResourceWithConditions<C>,
  type: string,
): boolean => getStatusConditionsByType(entity, type)?.status === 'True';

export const getStatusConditionMessage = <
  C extends { message?: string; type?: string } = K8sResourceCondition,
>(
  entity: ResourceWithConditions<C>,
  type: string,
): string | undefined => getStatusConditionsByType(entity, type)?.message;

export const getStatusConditionReason = <
  C extends { reason?: string; type?: string } = K8sResourceCondition,
>(
  entity: ResourceWithConditions<C>,
  type: string,
): string | undefined => getStatusConditionsByType(entity, type)?.reason;

export const getStatusPhase = <T = string>(entity: K8sResourceKind): T => entity?.status?.phase;
