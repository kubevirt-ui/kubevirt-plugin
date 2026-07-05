import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8sResourceCommon, Patch } from '@openshift-console/dynamic-plugin-sdk';

import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { escapeJsonPointerToken, isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const KUBEVIRT_JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';

const parseJsonPatchAnnotation = (annotationValue: string): Patch[] => {
  try {
    if (!annotationValue) return [];
    const parsed = JSON.parse(annotationValue);
    return Array.isArray(parsed) ? (parsed as Patch[]) : [];
  } catch {
    return [];
  }
};

const getUpdatedPatches = (
  existingPatches: Patch[],
  isChecked: boolean,
  featureGatePatch: Patch,
) => {
  if (isChecked) {
    const alreadyExists = existingPatches.some(
      (existingPatch) => existingPatch?.value === featureGatePatch?.value,
    );
    return [...existingPatches, ...(alreadyExists ? [] : [featureGatePatch])];
  }

  return existingPatches.filter(
    (existingPatch) => existingPatch?.value !== featureGatePatch?.value,
  );
};

type ToggleFeatureGateAnnotationParams = {
  cluster: string;
  featureGatePatch: Patch;
  hyperConvergeConfiguration: K8sResourceCommon;
  isChecked: boolean;
};

export const toggleFeatureGateAnnotation = ({
  cluster,
  featureGatePatch,
  hyperConvergeConfiguration,
  isChecked,
}: ToggleFeatureGateAnnotationParams) => {
  if (!hyperConvergeConfiguration) {
    return Promise.reject(new Error('HyperConverged configuration is not loaded'));
  }

  const annotations = getAnnotations(hyperConvergeConfiguration) || {};
  const currentValue = annotations[KUBEVIRT_JSONPATCH_ANNOTATION];

  const existingPatches = parseJsonPatchAnnotation(currentValue);

  const updatedPatches = getUpdatedPatches(existingPatches, isChecked, featureGatePatch);

  const hasAnnotations = !isEmpty(annotations);

  const patch: Patch[] = [
    ...(!hasAnnotations ? [{ op: K8S_OPS.ADD, path: '/metadata/annotations', value: {} }] : []),
    {
      op:
        hasAnnotations && KUBEVIRT_JSONPATCH_ANNOTATION in annotations
          ? K8S_OPS.REPLACE
          : K8S_OPS.ADD,
      path: `/metadata/annotations/${escapeJsonPointerToken(KUBEVIRT_JSONPATCH_ANNOTATION)}`,
      value: JSON.stringify(updatedPatches),
    },
  ];

  return kubevirtK8sPatch({
    cluster,
    data: patch,
    model: HyperConvergedModel,
    resource: hyperConvergeConfiguration,
  });
};
