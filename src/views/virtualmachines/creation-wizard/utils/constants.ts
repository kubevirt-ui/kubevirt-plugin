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
