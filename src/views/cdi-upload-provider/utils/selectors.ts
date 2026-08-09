import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type K8sIoApiCoreV1PersistentVolumeClaimSpecAccessModesEnum,
  type K8sIoApiCoreV1PersistentVolumeClaimSpecVolumeModeEnum,
  type K8sIoApiCoreV1VolumeResourceRequirements,
  type V1beta1PersistentVolumeClaim,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1Template } from '@kubevirt-utils/models';
import { getAnnotations, getLabel, getLabels } from '@kubevirt-utils/resources/shared';
import {
  TEMPLATE_BASE_IMAGE_NAME_PARAMETER,
  TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER,
  TEMPLATE_VERSION_LABEL,
} from '@kubevirt-utils/resources/template';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';
import {
  getAPIVersionForModel,
  type K8sModel,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  CDI_CLONE_TOKEN_ANNOTAION,
  CDI_KUBEVIRT_IO,
  CDI_PVC_PHASE_RUNNING,
  CDI_UPLOAD_POD_ANNOTATION,
  CDI_UPLOAD_POD_NAME_ANNOTATION,
  STORAGE_IMPORT_POD_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_OS_NAME_ANNOTATION,
  VM_TEMPLATE_NAME_PARAMETER,
} from './consts';
import type { OperatingSystemRecord } from './types';
import { compareVersions, removeOSDups, stringValueUnitSplit } from './utils';

export { getGiBUploadPVCSizeByImage } from './uploadSize';

const getAnnotation = (
  pvc: V1beta1PersistentVolumeClaim,
  annotationName: string,
  defaultValue?: string,
): string => pvc?.metadata?.annotations?.[annotationName] ?? defaultValue;

const getStorageSize = (value: K8sIoApiCoreV1VolumeResourceRequirements): string =>
  value?.requests?.storage?.toString() ?? '';

const getParameterValue = (obj: V1Template, name: string, defaultValue = null): string =>
  obj?.parameters?.find((parameter) => parameter.name === name)?.value ?? defaultValue;

const getPVCDataVolumeResources = (
  dataVolume: V1beta1DataVolume,
): K8sIoApiCoreV1VolumeResourceRequirements => dataVolume?.spec?.pvc?.resources;

const getDataVolumeResources = (
  dataVolume: V1beta1DataVolume,
): K8sIoApiCoreV1VolumeResourceRequirements =>
  dataVolume?.spec?.storage?.resources ?? getPVCDataVolumeResources(dataVolume);

export const getDataVolumeStorageSize = (dataVolume: V1beta1DataVolume): string =>
  getStorageSize(getDataVolumeResources(dataVolume));

export const getPVCNamespace = (obj: V1Template): string =>
  getParameterValue(obj, TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER) ||
  getParameterValue(obj, TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER);

export const getPVCName = (obj: V1Template): string =>
  getParameterValue(obj, TEMPLATE_BASE_IMAGE_NAME_PARAMETER) ||
  getParameterValue(obj, TEMPLATE_DATA_SOURCE_NAME_PARAMETER);

export const getPvcResources = (
  pvc: V1beta1PersistentVolumeClaim,
): K8sIoApiCoreV1VolumeResourceRequirements => pvc?.spec?.resources;

export const getPvcStorageSize = (pvc: V1beta1PersistentVolumeClaim): string =>
  getStorageSize(getPvcResources(pvc));

export const getPvcAccessModes = (
  pvc: V1beta1PersistentVolumeClaim,
): K8sIoApiCoreV1PersistentVolumeClaimSpecAccessModesEnum[] => pvc?.spec?.accessModes;
export const getPvcVolumeMode = (
  pvc: V1beta1PersistentVolumeClaim,
): K8sIoApiCoreV1PersistentVolumeClaimSpecVolumeModeEnum => pvc?.spec?.volumeMode;
export const getPvcStorageClassName = (pvc: V1beta1PersistentVolumeClaim): string =>
  pvc?.spec?.storageClassName;

export const getPvcImportPodName = (pvc: V1beta1PersistentVolumeClaim): string =>
  getAnnotation(pvc, STORAGE_IMPORT_POD_LABEL);

// upload pvc selectors
export const getPvcUploadPodName = (pvc: V1beta1PersistentVolumeClaim): string =>
  getAnnotation(pvc, CDI_UPLOAD_POD_NAME_ANNOTATION);

export const getPvcPhase = (pvc: V1beta1PersistentVolumeClaim): string =>
  getAnnotation(pvc, CDI_UPLOAD_POD_ANNOTATION);

export const getPvcCloneToken = (pvc: V1beta1PersistentVolumeClaim): string =>
  getAnnotation(pvc, CDI_CLONE_TOKEN_ANNOTAION);

export const isPvcUploading = (pvc: V1beta1PersistentVolumeClaim): boolean =>
  !getPvcCloneToken(pvc) && getPvcUploadPodName(pvc) && getPvcPhase(pvc) === CDI_PVC_PHASE_RUNNING;

export const isPvcCloning = (pvc: V1beta1PersistentVolumeClaim): boolean =>
  !!getPvcCloneToken(pvc) && getPvcPhase(pvc) === CDI_PVC_PHASE_RUNNING;

export const isPvcBoundToCDI = (pvc: V1beta1PersistentVolumeClaim): boolean =>
  pvc?.metadata?.ownerReferences?.some(
    (ownerRef) =>
      ownerRef.apiVersion.startsWith(CDI_KUBEVIRT_IO) &&
      ownerRef.kind === DataVolumeModel.kind &&
      ownerRef.name === pvc?.metadata?.name,
  );

export const getName = <A extends K8sResourceCommon = K8sResourceCommon>(value: A): string =>
  value?.metadata?.name;

export const getNamespace = <A extends K8sResourceCommon = K8sResourceCommon>(value: A): string =>
  value?.metadata?.namespace;

export const getKubevirtModelAvailableAPIVersion = (model: K8sModel): string =>
  getAPIVersionForModel(model);

export const getVM = (vmTemplate: V1Template): V1VirtualMachine =>
  vmTemplate?.objects?.find((obj) => obj?.kind === VirtualMachineModel?.kind);

export const getTemplatesLabelValues = (templates: V1Template[], label: string): string[] => {
  const labelValues = [];
  for (const template of templates ?? []) {
    const labels = Object.keys(getLabels(template, {})).filter((lbl) => lbl.startsWith(label));
    for (const lbl of labels) {
      const labelParts = lbl.split('/');
      if (labelParts.length > 1) {
        const labelName = labelParts[labelParts.length - 1];
        if (!labelValues.includes(labelName)) {
          labelValues.push(labelName);
        }
      }
    }
  }
  return labelValues;
};

export const getTemplateOperatingSystems = (templates: V1Template[]): OperatingSystemRecord[] => {
  const osIds = getTemplatesLabelValues(templates, TEMPLATE_OS_LABEL);
  const sortedTemplates = [...templates].sort((a, b) => {
    const aVersion = getLabel(a, TEMPLATE_VERSION_LABEL);
    const bVersion = getLabel(b, TEMPLATE_VERSION_LABEL);

    return -1 * compareVersions(aVersion, bVersion);
  });

  return removeOSDups(
    osIds.map((osId) => {
      const nameAnnotation = `${TEMPLATE_OS_NAME_ANNOTATION}/${osId}`;
      const template = sortedTemplates?.find(
        (t) =>
          !!Object.keys(getAnnotations(t, {}))?.find((annotation) => annotation === nameAnnotation),
      );
      const vm = getVM(template);
      const dvTemplates = getDataVolumeTemplates(vm);
      const dvt = dvTemplates?.find((tmpl) => tmpl?.metadata?.name === VM_TEMPLATE_NAME_PARAMETER);

      return {
        baseImageName: getPVCName(template),
        baseImageNamespace: getPVCNamespace(template),
        baseImageRecomendedSize:
          dvt &&
          stringValueUnitSplit(getDataVolumeStorageSize(dvt as unknown as V1beta1DataVolume)),
        id: osId,
        isSourceRef: !!dvt?.spec?.sourceRef,
        name: getAnnotation(template, nameAnnotation),
      };
    }),
  );
};
