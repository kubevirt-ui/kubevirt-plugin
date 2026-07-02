import { TFunction } from 'i18next';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';

import { getDiskSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import CloneIcon from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/CloneIcon';
import { InstanceTypeIcon } from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/InstanceTypeIcon';
import TemplateIcon from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/TemplateIcon';
import {
  CLONE_FLOW,
  INSTANCE_TYPE_FLOW,
  TEMPLATE_FLOW,
  VMCreationMethod,
  VMWizardStep,
} from '@virtualmachines/creation-wizard-new/utils/constants';

import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_STEP_NAVIGATION,
} from '../state/vm-wizard-form/consts';
import { VMWizardFormValues } from '../state/vm-wizard-form/types';

import {
  ApplySelectedBootableVolumeToForm,
  VMCreationMethodCardDetails,
  VMCreationMethodConfig,
} from './types';

const VM_CREATION_METHOD_MAPPER: Record<VMCreationMethod, VMCreationMethodConfig> = {
  [VMCreationMethod.CLONE]: {
    activeFlow: CLONE_FLOW,
    cardDetails: (t) => ({
      description: t('Create a copy of an existing VirtualMachine.'),
      IconComponent: CloneIcon,
      label: t('Clone existing VirtualMachine'),
    }),
  },
  [VMCreationMethod.INSTANCE_TYPE]: {
    activeFlow: INSTANCE_TYPE_FLOW,
    cardDetails: (t) => ({
      description: t(
        'Create a new VM by selecting an operating system and the right performance for your workload.',
      ),
      IconComponent: InstanceTypeIcon,
      label: t('Custom configuration (default)'),
    }),
  },
  [VMCreationMethod.TEMPLATE]: {
    activeFlow: TEMPLATE_FLOW,
    cardDetails: (t) => ({
      description: t(
        'Create a pre-configured VM using standardized images. This option requires an existing template.',
      ),
      IconComponent: TemplateIcon,
      label: t('Create from Template'),
    }),
  },
};

export const getActiveFlow = (creationMethod: VMCreationMethod): readonly VMWizardStep[] =>
  VM_CREATION_METHOD_MAPPER[creationMethod].activeFlow;

export const getVMCreationMethodDetails = (
  creationMethod: VMCreationMethod,
  t: TFunction,
): VMCreationMethodCardDetails => VM_CREATION_METHOD_MAPPER[creationMethod].cardDetails(t);

export const isCloneCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.CLONE;
export const isTemplateCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.TEMPLATE;
export const isInstanceTypeCreationMethod = (creationMethod: VMCreationMethod) =>
  creationMethod === VMCreationMethod.INSTANCE_TYPE;

export const applySelectedBootableVolumeToForm = ({
  dvSource,
  getValues,
  pvcSource,
  selectedVolume,
  setValue,
  volumeSnapshotSource,
}: ApplySelectedBootableVolumeToForm): void => {
  const instanceTypeName = getInstanceTypeFromVolume(selectedVolume);
  const [series = '', size = ''] = instanceTypeName?.split('.') || [];

  setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT, {
    ...getValues(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT),
    customDiskSize: getDiskSize(dvSource, pvcSource, volumeSnapshotSource),
    dvSource,
    pvcSource,
    selectedBootableVolume: selectedVolume,
    selectedInstanceType: {
      name: instanceTypeName,
      namespace: null,
    },
    selectedSeries: series,
    selectedSize: size,
    volumeSnapshotSource,
  });
};

export const markStepVisited = (
  stepId: string,
  getValues: UseFormGetValues<VMWizardFormValues>,
  setValue: UseFormSetValue<VMWizardFormValues>,
) => {
  const visitedSteps = getValues(CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.VISITED_STEPS);
  if (visitedSteps.has(stepId)) {
    return;
  }

  const nextVisitedSteps = new Set(visitedSteps);
  nextVisitedSteps.add(stepId);
  setValue(CREATE_VM_FORM_FIELDS_STEP_NAVIGATION.VISITED_STEPS, nextVisitedSteps);
};
