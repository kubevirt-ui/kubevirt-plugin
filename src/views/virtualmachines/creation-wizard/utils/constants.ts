export enum CREATE_VM_TAB {
  INSTANCE_TYPES = '/instanceTypes',
  TEMPLATE = '/template',
}

export enum VMCreationMethod {
  CLONE = 'clone',
  INSTANCE_TYPE = 'instance-type',
  TEMPLATE = 'template',
}

export enum VMWizardStep {
  BOOT_SOURCE = 'vm-creation-boot-source-step',
  CLONE = 'vm-creation-clone-step',
  COMPUTE_RESOURCES = 'vm-creation-compute-resources-step',
  CUSTOMIZATION = 'vm-creation-customization-step',
  DEPLOYMENT_DETAILS = 'vm-creation-deployment-details-step',
  GUEST_OS = 'vm-creation-guest-os-step',
  REVIEW_AND_CREATE = 'vm-creation-review-and-create-step',
  TEMPLATE = 'vm-creation-template-step',
}

export const INSTANCE_TYPE_FLOW: VMWizardStep[] = [
  VMWizardStep.DEPLOYMENT_DETAILS,
  VMWizardStep.GUEST_OS,
  VMWizardStep.BOOT_SOURCE,
  VMWizardStep.COMPUTE_RESOURCES,
  VMWizardStep.CUSTOMIZATION,
  VMWizardStep.REVIEW_AND_CREATE,
];

export const TEMPLATE_FLOW: VMWizardStep[] = [
  VMWizardStep.DEPLOYMENT_DETAILS,
  VMWizardStep.TEMPLATE,
  VMWizardStep.CUSTOMIZATION,
  VMWizardStep.REVIEW_AND_CREATE,
];

export const CLONE_FLOW: VMWizardStep[] = [
  VMWizardStep.DEPLOYMENT_DETAILS,
  VMWizardStep.CLONE,
  VMWizardStep.REVIEW_AND_CREATE,
];

export const VM_GENERATION_STEPS = new Set<number | string>([
  VMWizardStep.TEMPLATE,
  VMWizardStep.COMPUTE_RESOURCES,
]);
