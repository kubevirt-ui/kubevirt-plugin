import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BinaryUnit } from '@kubevirt-utils/utils/units';

import BandwidthInput from '../compnents/BandwidthInput/BandwidthInput';
import CompletionTimeout from '../compnents/CompletionTimeout/CompletionTimeout';
import YesNoDropdown from '../compnents/YesNoDropdown/YesNoDropdown';

import { MigrationPolicyConfigurationOption } from './constants';

export const getMigrationPolicyConfigurationOptions = (): MigrationPolicyConfigurationOption => {
  return {
    allowAutoConverge: {
      component: YesNoDropdown,
      defaultValue: false,
      label: t('Auto converge'),
    },
    allowPostCopy: {
      component: YesNoDropdown,
      defaultValue: false,
      label: t('Post-copy'),
    },
    bandwidthPerMigration: {
      component: BandwidthInput,
      defaultValue: { unit: BinaryUnit.Mi, value: 0 },
      description: t('To gain unlimited bandwidth, set to 0'),
      label: t('Bandwidth per migration'),
    },
    completionTimeoutPerGiB: {
      component: CompletionTimeout,
      defaultValue: 0,
      description: t('(In seconds)'),
      label: t('Completion timeout'),
    },
  };
};
