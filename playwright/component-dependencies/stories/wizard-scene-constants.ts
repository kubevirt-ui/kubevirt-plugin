/** Namespace used by gallery wizard stubs and scene fixtures. */
export const WIZARD_SCENE_NAMESPACE = 'default';

/** Default VM creation wizard story in the component gallery. */
export const WIZARD_STORY = 'scenes/vm-wizard/VmCreationWizardShell/Default';

/** Wizard step element ids (mirror `VMWizardStep` in production). */
export const WizardSceneStep = {
  BOOT_SOURCE: 'vm-creation-boot-source-step',
  CLONE: 'vm-creation-clone-step',
  COMPUTE_RESOURCES: 'vm-creation-compute-resources-step',
  CUSTOMIZATION: 'vm-creation-customization-step',
  DEPLOYMENT_DETAILS: 'vm-creation-deployment-details-step',
  GUEST_OS: 'vm-creation-guest-os-step',
  REVIEW_AND_CREATE: 'vm-creation-review-and-create-step',
  TEMPLATE: 'vm-creation-template-step',
} as const;
