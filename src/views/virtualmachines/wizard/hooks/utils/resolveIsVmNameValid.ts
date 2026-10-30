import { vmNameInputSchema } from '@virtualmachines/wizard/form/schema/deployment/createDeploymentSchema';

type ResolveIsVmNameValidParams = {
  enforceStrictName: boolean;
  hasFormNameError: boolean;
  isVmNameRequired: boolean;
  vmName: string | undefined;
};

export const resolveIsVmNameValid = ({
  enforceStrictName,
  hasFormNameError,
  isVmNameRequired,
  vmName,
}: ResolveIsVmNameValidParams): boolean => {
  if (!isVmNameRequired) {
    return true;
  }

  if (enforceStrictName) {
    return !hasFormNameError;
  }

  return vmNameInputSchema.isValidSync(vmName);
};
