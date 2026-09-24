import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/wizard/utils/constants';

import { type CreateInitialVMWizardFormValuesArgs, type VMWizardFormValues } from './types';
export const createInitialVMWizardFormValues = ({
  cluster,
  creationMethod,
  description,
  folder,
  name,
  project,
}: CreateInitialVMWizardFormValuesArgs = {}): VMWizardFormValues => ({
  clone: { sourceVM: null },
  creationMethod: creationMethod ?? VMCreationMethod.INSTANCE_TYPE,
  customization: {
    autoLabelsApplied: false,
    pendingBootableVolumeUploadKeys: [],
    templateAdditionalObjects: [],
    vmDraft: null,
  },
  deployment: {
    cluster: cluster ?? '',
    description: description ?? '',
    folder: folder ?? '',
    name: name ?? undefined,
    project: project ?? '',
  },
  instanceType: {
    bootVolume: null,
    compute: null,
    operatingSystem: OperatingSystemType.RHEL,
    preference: null,
    useBootSource: true,
    volumeNamespace: '',
  },
  navigation: {
    currentStep: VMWizardStep.DEPLOYMENT_DETAILS,
    strictVMName: false,
    visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  },
  template: {
    isDrawerOpen: false,
    lastProcessedKey: '',
    processError: null,
    selectedTemplate: null,
  },
});
