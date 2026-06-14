import { FieldPath } from 'react-hook-form';

import {
  CreateInitialVMWizardFormValuesArgs,
  VMWizardFormValues,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import {
  VMCreationMethod,
  VMWizardStep,
} from '@virtualmachines/creation-wizard-new/utils/constants';

export const createInitialVMWizardFormValues = ({
  cluster,
  namespace,
}: CreateInitialVMWizardFormValuesArgs): VMWizardFormValues => ({
  instanceTypeData: {
    customDiskSize: '',
    dvSource: null,
    operatingSystemType: OperatingSystemType.RHEL,
    preference: null,
    pvcSource: null,
    selectedBootableVolume: null,
    selectedInstanceType: null,
    selectedSeries: '',
    selectedSize: '',
    useBootSource: true,
    volumeListNamespace: '',
    volumeSnapshotSource: null,
  },
  stepNavigation: {
    visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  },
  uiState: {
    isTemplatesDrawerOpen: false,
    lastProcessedTemplateKey: '',
    shouldCheckVMNameProperly: false,
  },
  vmData: {
    cluster,
    creationMethod: VMCreationMethod.INSTANCE_TYPE,
    description: '',
    folder: '',
    name: undefined,
    project: namespace,
    selectedTemplate: null,
  },
});

export const CREATE_VM_FORM_FIELDS_VM_DATA: Record<string, FieldPath<VMWizardFormValues>> = {
  CLUSTER: 'vmData.cluster',
  CREATION_METHOD: 'vmData.creationMethod',
  DESCRIPTION: 'vmData.description',
  FOLDER: 'vmData.folder',
  NAME: 'vmData.name',
  PROJECT: 'vmData.project',
  ROOT: 'vmData',
  SELECTED_TEMPLATE: 'vmData.selectedTemplate',
};

export const CREATE_VM_FORM_FIELDS_UI_STATE: Record<string, FieldPath<VMWizardFormValues>> = {
  IS_TEMPLATES_DRAWER_OPEN: 'uiState.isTemplatesDrawerOpen',
  LAST_PROCESSED_TEMPLATE_KEY: 'uiState.lastProcessedTemplateKey',
  SHOULD_CHECK_VM_NAME_PROPERLY: 'uiState.shouldCheckVMNameProperly',
};

export const CREATE_VM_FORM_FIELDS_STEP_NAVIGATION: Record<
  string,
  FieldPath<VMWizardFormValues>
> = {
  VISITED_STEPS: 'stepNavigation.visitedSteps',
};

export const CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA: Record<
  string,
  FieldPath<VMWizardFormValues>
> = {
  OPERATING_SYSTEM_TYPE: 'instanceTypeData.operatingSystemType',
  PREFERENCE: 'instanceTypeData.preference',
  ROOT: 'instanceTypeData',
  SELECTED_BOOTABLE_VOLUME: 'instanceTypeData.selectedBootableVolume',
  SELECTED_INSTANCE_TYPE: 'instanceTypeData.selectedInstanceType',
  SELECTED_SERIES: 'instanceTypeData.selectedSeries',
  SELECTED_SIZE: 'instanceTypeData.selectedSize',
  USE_BOOT_SOURCE: 'instanceTypeData.useBootSource',
  VOLUME_LIST_NAMESPACE: 'instanceTypeData.volumeListNamespace',
};
