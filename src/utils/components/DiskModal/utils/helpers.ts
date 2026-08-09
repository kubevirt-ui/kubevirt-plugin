import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1DataVolumeTemplateSpec,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVmDiskUploadSuccessLinks } from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadLinks';
import { type CdiUploadTrackMetadata } from '@kubevirt-utils/hooks/useUploadProgressToast/types';
import {
  buildOwnerReference,
  getName,
  getNamespace,
  getUID,
} from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { getCluster } from '@multicluster/helpers/selectors';

import { type BuildUploadTrackMetadataParams, type V1DiskFormState } from './types';

export * from './diskOperations';
export * from './diskValidation';
export * from './hotplugHelpers';
export * from './vmProducers';

export const getEmptyVMDataVolumeResource = (
  vm: V1VirtualMachine,
  createOwnerReference?: boolean,
): V1beta1DataVolume => {
  // Only set ownerReference if explicitly requested AND the VM exists in the cluster
  // (has a resourceVersion, which indicates it's been persisted)
  // Setting ownerReference to a non-existent VM causes immediate garbage collection
  const shouldSetOwnerRef =
    createOwnerReference === true && getUID(vm) && vm?.metadata?.resourceVersion;

  return {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    cluster: getCluster(vm),
    kind: DataVolumeModel.kind,
    metadata: {
      name: '',
      namespace: getNamespace(vm),
      ...(shouldSetOwnerRef
        ? { ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })] }
        : {}),
    },
    spec: {
      storage: {
        resources: {
          requests: {
            storage: '',
          },
        },
      },
    },
  };
};

export const diskModalTitle = (isEditDisk: boolean, isVMRunning: boolean): string => {
  if (isEditDisk) return t('Edit disk');
  return isVMRunning ? t('Add disk (hot plugged)') : t('Add disk');
};

export const createDataVolumeName = (vm: V1VirtualMachine, diskName: string): string => {
  const middlePart = [getName(vm), diskName].filter(isDNS1123Label).join('-').substring(0, 53);
  // prefix: 2
  // middlePart: max 53
  // suffix: 6
  // hyphens: max 2
  // together: max 63
  return `dv-${middlePart}${!middlePart || middlePart.endsWith('-') ? '' : '-'}${getRandomChars(6)}`;
};

export const convertDataVolumeToTemplate = (
  dataVolume: V1beta1DataVolume,
): V1DataVolumeTemplateSpec => ({
  metadata: dataVolume?.metadata,
  spec: {
    source: dataVolume.spec?.source,
    sourceRef: dataVolume.spec?.sourceRef,
    storage: {
      accessModes: dataVolume.spec.storage?.accessModes,
      resources: dataVolume.spec.storage?.resources,
    },
  },
});

/**
 * Creates a shallow copy of the form data with a mutable dataVolumeTemplate.spec.source.
 * Needed for fire-and-forget uploads where uploadDataVolume attempts to delete
 * source.upload on a possibly frozen react-hook-form object.
 */
export const createMutableUploadData = (data: V1DiskFormState): V1DiskFormState => {
  if (!data.dataVolumeTemplate) return data;

  return {
    ...data,
    dataVolumeTemplate: {
      ...data.dataVolumeTemplate,
      spec: {
        ...data.dataVolumeTemplate.spec,
        source: { ...data.dataVolumeTemplate.spec?.source },
      },
    },
  };
};

export const buildUploadTrackMetadata = ({
  abortTooltip,
  data,
  dataVolume,
  file,
  isCDROM,
  onCancelCleanup,
  t: translate,
  uploadKey,
  vm,
}: BuildUploadTrackMetadataParams): CdiUploadTrackMetadata | undefined => {
  if (!uploadKey || !file) return undefined;

  const dvName = getName(dataVolume);
  const diskName = data.disk?.name;

  return {
    abortTooltip,
    contextLinks: getUID(vm)
      ? getVmDiskUploadSuccessLinks(translate, vm, diskName, dvName, isCDROM)
      : undefined,
    dvCluster: getCluster(vm),
    dvName,
    dvNamespace: getNamespace(dataVolume),
    onCancelCleanup,
    resourceName: diskName,
  };
};
