import { TFunction } from 'react-i18next';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import {
  getDataVolumeSize,
  getPVCSize,
  getVolumeSnapshotSize,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import CloneIcon from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/CloneIcon';
import { InstanceTypeIcon } from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/InstanceTypeIcon';
import TemplateIcon from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/TemplateIcon';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const isCloneCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.CLONE;
export const isTemplateCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.TEMPLATE;
export const isInstanceTypeCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.INSTANCE_TYPE;

export const getVMCreationMethodsDetails = (t: TFunction) => {
  return {
    [VMCreationMethod.CLONE]: {
      description: t('Create a copy of an existing VirtualMachine.'),
      IconComponent: CloneIcon,
      label: t('Clone existing VirtualMachine'),
    },
    [VMCreationMethod.INSTANCE_TYPE]: {
      description: t(
        'Create a new VM by selecting an operating system and the right performance for your workload.',
      ),
      IconComponent: InstanceTypeIcon,
      label: t('Custom configuration (default)'),
    },
    [VMCreationMethod.TEMPLATE]: {
      description: t(
        'Create a pre-configured VM using standardized images. This option requires an existing template.',
      ),
      IconComponent: TemplateIcon,
      label: t('Create from Template'),
    },
  };
};

export const getVMCreationMethodDetails = (creationMethod: VMCreationMethod, t: TFunction) =>
  getVMCreationMethodsDetails(t)[creationMethod];

export const getDiskSize = (
  dataVolume: V1beta1DataVolume,
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  volumeSnapshot: VolumeSnapshotKind,
) => getDataVolumeSize(dataVolume) || getPVCSize(pvc) || getVolumeSnapshotSize(volumeSnapshot);
