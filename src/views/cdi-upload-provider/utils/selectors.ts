import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  K8sIoApiCoreV1ResourceRequirements,
  V1beta1PersistentVolumeClaim,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1Template } from '@kubevirt-utils/models';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  TEMPLATE_BASE_IMAGE_NAME_PARAMETER,
  TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER,
} from '@kubevirt-utils/resources/template';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';
import { multipliers } from '@kubevirt-utils/utils/units';
import {
  getAPIVersionForModel,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { TEMPLATE_VERSION_LABEL } from './../../../utils/resources/template/utils/constants';
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
import { compareVersions, removeOSDups, stringValueUnitSplit } from './utils';

export const getLabels = (entity: K8sResourceCommon, defaultValue?: { [key: string]: string }) =>
  entity?.metadata?.labels || defaultValue;

export const getAnnotations = (
  vm: K8sResourceCommon,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } => vm?.metadata.annotations || defaultValue;

const getAnnotation = (
  pvc: V1beta1PersistentVolumeClaim,
  annotationName: string,
  defaultValue?: string,
): string => pvc?.metadata?.annotations?.[annotationName] || defaultValue;

const getStorageSize = (value: K8sIoApiCoreV1ResourceRequirements): string =>
  value?.requests.storage;

const getParameterValue = (obj: V1Template, name: string, defaultValue = null): string =>
  obj?.parameters?.find((parameter) => parameter.name === name)?.value || defaultValue;

const getPVCDataVolumeResources = (dataVolume: V1beta1DataVolume) =>
  dataVolume?.spec?.pvc?.resources;

const getDataVolumeResources = (dataVolume: V1beta1DataVolume) =>
  dataVolume?.spec?.storage?.resources || getPVCDataVolumeResources(dataVolume);

export const getDataVolumeStorageSize = (dataVolume: V1beta1DataVolume): string =>
  getStorageSize(getDataVolumeResources(dataVolume));

export const getPVCNamespace = (obj: V1Template): string =>
  getParameterValue(obj, TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER) ||
  getParameterValue(obj, TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER);

export const getPVCName = (obj: V1Template): string =>
  getParameterValue(obj, TEMPLATE_BASE_IMAGE_NAME_PARAMETER) ||
  getParameterValue(obj, TEMPLATE_DATA_SOURCE_NAME_PARAMETER);

export const getPvcResources = (pvc: V1beta1PersistentVolumeClaim) => pvc?.spec?.resources;

export const getPvcStorageSize = (pvc: V1beta1PersistentVolumeClaim): string =>
  getStorageSize(getPvcResources(pvc));

export const getPvcAccessModes = (pvc: V1beta1PersistentVolumeClaim) => pvc?.spec?.accessModes;
export const getPvcVolumeMode = (pvc: V1beta1PersistentVolumeClaim) => pvc?.spec?.volumeMode;
export const getPvcStorageClassName = (pvc: V1beta1PersistentVolumeClaim): string =>
  pvc?.spec?.storageClassName;

export const getPvcImportPodName = (pvc: V1beta1PersistentVolumeClaim) =>
  getAnnotation(pvc, STORAGE_IMPORT_POD_LABEL);

// upload pvc selectors
export const getPvcUploadPodName = (pvc: V1beta1PersistentVolumeClaim) =>
  getAnnotation(pvc, CDI_UPLOAD_POD_NAME_ANNOTATION);

export const getPvcPhase = (pvc: V1beta1PersistentVolumeClaim) =>
  getAnnotation(pvc, CDI_UPLOAD_POD_ANNOTATION);

export const getPvcCloneToken = (pvc: V1beta1PersistentVolumeClaim) =>
  getAnnotation(pvc, CDI_CLONE_TOKEN_ANNOTAION);

export const isPvcUploading = (pvc: V1beta1PersistentVolumeClaim) =>
  !getPvcCloneToken(pvc) && getPvcUploadPodName(pvc) && getPvcPhase(pvc) === CDI_PVC_PHASE_RUNNING;

export const isPvcCloning = (pvc: V1beta1PersistentVolumeClaim) =>
  !!getPvcCloneToken(pvc) && getPvcPhase(pvc) === CDI_PVC_PHASE_RUNNING;

export const isPvcBoundToCDI = (pvc: V1beta1PersistentVolumeClaim) =>
  pvc?.metadata?.ownerReferences?.some(
    (or) =>
      or.apiVersion.startsWith(CDI_KUBEVIRT_IO) &&
      or.kind === DataVolumeModel.kind &&
      or.name === pvc?.metadata?.name,
  );

export const getName = <A extends K8sResourceCommon = K8sResourceCommon>(value: A) =>
  value?.metadata?.name;

export const getNamespace = <A extends K8sResourceCommon = K8sResourceCommon>(value: A) =>
  value?.metadata?.namespace;

export const getKubevirtModelAvailableAPIVersion = (model: K8sModel): string =>
  getAPIVersionForModel(model);

export const getVM = (vmTemplate: V1Template): V1VirtualMachine =>
  vmTemplate?.objects?.find((obj) => obj?.kind === VirtualMachineModel?.kind);

export const getTemplatesLabelValues = (templates: V1Template[], label: string): string[] => {
  const labelValues = [];
  (templates || []).forEach((template) => {
    const labels = Object.keys(getLabels(template, {})).filter((l) => l.startsWith(label));
    labels.forEach((l) => {
      const labelParts = l.split('/');
      if (labelParts.length > 1) {
        const labelName = labelParts[labelParts.length - 1];
        if (labelValues.indexOf(labelName) === -1) {
          labelValues.push(labelName);
        }
      }
    });
  });
  return labelValues;
};

export const getGiBUploadPVCSizeByImage = (sizeInBytes: number) => {
  const sizeGi = sizeInBytes / multipliers.Gi;

  if (sizeGi < 0.5) return 1;
  return Math.ceil(sizeGi) * 2;
};

export const getTemplateOperatingSystems = (templates: V1Template[]) => {
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
      const dv = dvTemplates?.find((dvt) => dvt?.metadata?.name === VM_TEMPLATE_NAME_PARAMETER);

      return {
        baseImageName: getPVCName(template),
        baseImageNamespace: getPVCNamespace(template),
        baseImageRecomendedSize:
          dv && stringValueUnitSplit(getDataVolumeStorageSize(dv as unknown as V1beta1DataVolume)),
        id: osId,
        isSourceRef: !!dv?.spec?.sourceRef,
        name: getAnnotation(template, nameAnnotation),
      };
    }),
  );
};
