import { type FieldPath } from 'react-hook-form';

import {
  type CreateInitialVMWizardFormValuesArgs,
  type VMWizardFormValues,
} from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/wizard/utils/constants';

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
    currentStep: VMWizardStep.DEPLOYMENT_DETAILS,
    visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  },
  uiState: {
    isTemplatesDrawerOpen: false,
    lastProcessedTemplateKey: '',
    shouldCheckVMNameProperly: false,
    templateProcessError: null,
  },
  vmData: {
    autoLabelsMerged: false,
    bootSourceOverride: null,
    cluster,
    creationMethod: VMCreationMethod.INSTANCE_TYPE,
    description: '',
    folder: '',
    name: undefined,
    project: namespace,
    selectedTemplate: null,
  },
});

export const CREATE_VM_FORM_FIELDS_VM_DATA = {
  AUTO_LABELS_MERGED: 'vmData.autoLabelsMerged',
  BOOT_SOURCE_OVERRIDE: 'vmData.bootSourceOverride',
  CLUSTER: 'vmData.cluster',
  CREATION_METHOD: 'vmData.creationMethod',
  DESCRIPTION: 'vmData.description',
  FOLDER: 'vmData.folder',
  NAME: 'vmData.name',
  PROJECT: 'vmData.project',
  ROOT: 'vmData',
  SELECTED_TEMPLATE: 'vmData.selectedTemplate',
} as const satisfies Record<string, FieldPath<VMWizardFormValues>>;

export const CREATE_VM_FORM_FIELDS_UI_STATE = {
  IS_TEMPLATES_DRAWER_OPEN: 'uiState.isTemplatesDrawerOpen',
  LAST_PROCESSED_TEMPLATE_KEY: 'uiState.lastProcessedTemplateKey',
  SHOULD_CHECK_VM_NAME_PROPERLY: 'uiState.shouldCheckVMNameProperly',
  TEMPLATE_PROCESS_ERROR: 'uiState.templateProcessError',
} as const satisfies Record<string, FieldPath<VMWizardFormValues>>;

export const CREATE_VM_FORM_FIELDS_STEP_NAVIGATION = {
  CURRENT_STEP: 'stepNavigation.currentStep',
  VISITED_STEPS: 'stepNavigation.visitedSteps',
} as const satisfies Record<string, FieldPath<VMWizardFormValues>>;

export const CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA = {
  CUSTOM_DISK_SIZE: 'instanceTypeData.customDiskSize',
  DV_SOURCE: 'instanceTypeData.dvSource',
  OPERATING_SYSTEM_TYPE: 'instanceTypeData.operatingSystemType',
  PREFERENCE: 'instanceTypeData.preference',
  PVC_SOURCE: 'instanceTypeData.pvcSource',
  ROOT: 'instanceTypeData',
  SELECTED_BOOTABLE_VOLUME: 'instanceTypeData.selectedBootableVolume',
  SELECTED_INSTANCE_TYPE: 'instanceTypeData.selectedInstanceType',
  SELECTED_SERIES: 'instanceTypeData.selectedSeries',
  SELECTED_SIZE: 'instanceTypeData.selectedSize',
  USE_BOOT_SOURCE: 'instanceTypeData.useBootSource',
  VOLUME_LIST_NAMESPACE: 'instanceTypeData.volumeListNamespace',
} as const satisfies Record<string, FieldPath<VMWizardFormValues>>;
