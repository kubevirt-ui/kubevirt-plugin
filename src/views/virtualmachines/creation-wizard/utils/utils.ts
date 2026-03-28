import { TFunction } from 'react-i18next';

import CloneIcon from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/CloneIcon';
import { InstanceTypeIcon } from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/InstanceTypeIcon';
import TemplateIcon from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/TemplateIcon';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const getVMCreationMethodsDetails = (t: TFunction) => {
  return {
    [VMCreationMethod.CLONE]: {
      description: t('Create a copy of an existing VirtualMachine.'),
      IconComponent: CloneIcon,
      label: t('Clone existing VirtualMachine'),
    },
    [VMCreationMethod.INSTANCE_TYPE]: {
      description: t(
        'Create a VirtualMachine by selecting an operating system and the right performance for your workload.',
      ),
      IconComponent: InstanceTypeIcon,
      label: t('New VirtualMachine'),
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
