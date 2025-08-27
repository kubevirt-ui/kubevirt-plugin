import produce from 'immer';
import { Updater } from 'use-immer';

import { NAME_INPUT_FIELD } from '@catalog/templatescatalog/utils/consts';
import { TabsData } from '@catalog/utils/WizardVMContext/utils/tabs-data';
import { TemplateParameter, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DEFAULT_CDROM_DISK_SIZE,
  DEFAULT_DISK_SIZE,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import { SecretsData } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { getSecretEncodedSSHKey } from '@kubevirt-utils/resources/secret/utils/selectors';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getTemplateParameterValue,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import { getRootDataVolumeTemplateSpec, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty, removeDockerPrefix } from '@kubevirt-utils/utils/utils';

import { INSTALLATION_CDROM_NAME } from './StorageSection/constants';

export const hasValidSource = (template: V1Template) => {
  const vm = getTemplateVirtualMachineObject(template);

  const hasValidDVSources = hasVMValidDVSources(vm);
  const hasValidVolumeSources = hasVMValidVolumeSources(vm);
  return hasValidDVSources && hasValidVolumeSources;
};

const hasVMValidDVSources = (vm: V1VirtualMachine) => {
  if (!vm?.spec?.dataVolumeTemplates && !getVolumes(vm).find((volume) => volume.dataVolume))
    return true;

  return vm.spec.dataVolumeTemplates.every((dataVolume) => {
    if (dataVolume?.spec?.source?.http) return Boolean(dataVolume.spec.source.http.url);

    if (dataVolume?.spec?.source?.registry)
      return Boolean(removeDockerPrefix(dataVolume.spec.source.registry?.url));

    if (dataVolume?.spec?.source?.pvc)
      return (
        Boolean(dataVolume.spec.source.pvc.name) && Boolean(dataVolume.spec.source.pvc.namespace)
      );

    return true;
  });
};

const hasVMValidVolumeSources = (vm: V1VirtualMachine) =>
  vm.spec.template.spec.volumes.every((volume) => {
    if (volume?.containerDisk) return Boolean(removeDockerPrefix(volume?.containerDisk?.image));

    return true;
  });

export const allRequiredParametersAreFulfilled = (template: V1Template) =>
  template.parameters
    .filter((parameter) => parameter.required)
    .every((parameter) => parameter.value !== '');

export const hasNameParameter = (template: V1Template): boolean =>
  !isEmpty((template?.parameters || [])?.find((param) => param?.name === NAME_INPUT_FIELD));

export const getTemplateNameParameterValue = (template: V1Template): string =>
  getTemplateParameterValue(template, NAME_INPUT_FIELD);

export const changeTemplateParameterValue = (
  template: V1Template,
  parameterName: string,
  value: string,
): V1Template => {
  template.parameters = template.parameters.map((parameter) => {
    if (parameter.name === parameterName) parameter.value = value;

    return parameter;
  });

  return template;
};

export const getUploadDataVolume = (
  name: string,
  namespace: string,
  storage?: string,
): V1beta1DataVolume => ({
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: {
    source: {
      upload: {},
    },
    storage: {
      resources: {
        requests: {
          storage,
        },
      },
    },
  },
});

const uploadFile = async (
  vm: V1VirtualMachine,
  file: File | string,
  uploadData: (data: UploadDataProps) => Promise<void>,
  storage: string,
  dataVolumeName: string,
  namespace: string,
  updateTabsData?: Updater<TabsData>,
): Promise<V1Volume | void> => {
  if (!storage || !file) return Promise.resolve();

  const uploadDV = getUploadDataVolume(dataVolumeName, namespace, storage);

  await uploadData({ dataVolume: uploadDV, file: file as File });

  if (updateTabsData)
    // add ownerReference after vm creation for wizard
    updateTabsData((draft) => {
      ensurePath(draft, 'disks');

      draft.disks.dataVolumesToAddOwnerRef = draft?.disks?.dataVolumesToAddOwnerRef || [];
      draft.disks.dataVolumesToAddOwnerRef.push(uploadDV);
    });

  const volumeToEdit = getVolumes(vm)?.find((v) => v?.dataVolume?.name === dataVolumeName);

  return {
    name: volumeToEdit.name,
    persistentVolumeClaim: {
      claimName: volumeToEdit?.dataVolume?.name,
    },
  };
};

const replaceVolume = (vm: V1VirtualMachine, oldDVName: string, volume: V1Volume) => {
  vm.spec.template.spec.volumes = getVolumes(vm)?.filter((v) => v?.dataVolume?.name !== oldDVName);

  vm.spec.dataVolumeTemplates = vm.spec.dataVolumeTemplates.filter(
    (dvt) => dvt.metadata.name !== oldDVName,
  );

  vm.spec.template.spec.volumes.push(volume);
};

type UploadFiles = (input: {
  cdFile?: File | string;
  diskFile?: File | string;
  namespace: string;
  updateTabsData?: Updater<TabsData>;
  uploadCDData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  uploadDiskData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
  vm: V1VirtualMachine;
}) => Promise<V1VirtualMachine>;

export const uploadFiles: UploadFiles = ({
  cdFile,
  diskFile,
  namespace,
  updateTabsData,
  uploadCDData,
  uploadDiskData,
  vm,
}) => {
  const dataVolumeTemplate = getRootDataVolumeTemplateSpec(vm);

  const diskDVName = dataVolumeTemplate?.metadata?.name;
  const cdDVName = `${vm?.metadata?.name}-${INSTALLATION_CDROM_NAME}`;

  const cdDataVolumeTemplate = vm?.spec?.dataVolumeTemplates?.find(
    (dv) => dv?.metadata?.name === cdDVName,
  );

  return Promise.all([
    uploadFile(
      vm,
      diskFile,
      uploadDiskData,
      dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage || DEFAULT_DISK_SIZE,
      diskDVName,
      namespace,
      updateTabsData,
    ),
    uploadFile(
      vm,
      cdFile,
      uploadCDData,
      cdDataVolumeTemplate?.spec?.storage?.resources?.requests?.storage || DEFAULT_CDROM_DISK_SIZE,
      cdDVName,
      namespace,
      updateTabsData,
    ),
  ]).then(([newDiskVolume, newCDVolume]) => {
    return produce(vm, (vmDraft) => {
      if (newDiskVolume) {
        replaceVolume(vmDraft, diskDVName, newDiskVolume);
      }

      if (newCDVolume) {
        replaceVolume(vmDraft, cdDVName, newCDVolume);
      }
    });
  });
};

export const getTemplateParametersSplit = (
  parameters: TemplateParameter[],
): [required: TemplateParameter[], optional: TemplateParameter[]] =>
  parameters.reduce(
    (acc, currentParameter) => {
      if (currentParameter.name === NAME_INPUT_FIELD) return acc;

      acc[currentParameter.required ? 0 : 1].push(currentParameter);
      return acc;
    },
    [[], []],
  );

export const getSecretByNameAndNS = (
  secretName: string,
  namespace: string,
  projectsWithSecrets: { [p: string]: IoK8sApiCoreV1Secret[] },
) => projectsWithSecrets?.[namespace]?.find((secret) => getName(secret) === secretName);

export const sshSecretExistsInNamespace = (
  secretsData: SecretsData,
  templateNamespace: string,
  targetNamespace: string,
  secretName: string,
): boolean => {
  const { projectsWithSecrets, secretsLoaded } = secretsData;
  const originalSecret = getSecretByNameAndNS(secretName, templateNamespace, projectsWithSecrets);
  const targetSecret = getSecretByNameAndNS(secretName, targetNamespace, projectsWithSecrets);

  return (
    secretsLoaded &&
    getName(originalSecret) === getName(targetSecret) &&
    getSecretEncodedSSHKey(originalSecret) === getSecretEncodedSSHKey(targetSecret)
  );
};

export const getSSHSecretCopy = (
  secret: IoK8sApiCoreV1Secret,
  targetNamespace: string,
): IoK8sApiCoreV1Secret => {
  if (!secret) return null;
  return produce(secret, (draftSecret) => {
    draftSecret.metadata.namespace = targetNamespace;
  });
};
