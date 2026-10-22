import {
  HyperConvergedV1Beta1Model,
  HyperConvergedV1Beta1ModelGroupVersionKind,
  HyperConvergedV1Model,
  HyperConvergedV1ModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { type HyperConverged, type HyperConvergedV1 } from './types';

type HyperConvergedGroupVersionKind =
  | typeof HyperConvergedV1Beta1ModelGroupVersionKind
  | typeof HyperConvergedV1ModelGroupVersionKind;

export const isHyperConvergedV1 = (
  hyperConverged: HyperConverged | undefined,
): hyperConverged is HyperConvergedV1 =>
  Boolean(hyperConverged?.apiVersion && !hyperConverged.apiVersion.includes('v1beta1'));

export const getHyperConvergedModel = (isHCOV1: boolean): K8sModel =>
  isHCOV1 ? HyperConvergedV1Model : HyperConvergedV1Beta1Model;

export const getHyperConvergedGroupVersionKind = (
  isHCOV1: boolean,
): HyperConvergedGroupVersionKind =>
  isHCOV1 ? HyperConvergedV1ModelGroupVersionKind : HyperConvergedV1Beta1ModelGroupVersionKind;

export const getHyperConvergedModelFromResource = (
  hyperConverged: HyperConverged | undefined,
): K8sModel => getHyperConvergedModel(isHyperConvergedV1(hyperConverged));
