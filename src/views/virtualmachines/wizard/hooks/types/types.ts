import { type UseFormGetValues } from 'react-hook-form';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

export type GetMergedMetadataLabelsArgs = {
  adminLabels: AutoAppliedLabel[];
  description: string;
  folder: string;
  getValues: UseFormGetValues<VMWizardFormValues>;
  project: string;
  userDefaults: Record<string, string>;
  vmName: string;
};
