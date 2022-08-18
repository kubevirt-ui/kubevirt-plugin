import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BinaryUnit } from '@kubevirt-utils/utils/units';

import BandwidthInput from '../compnents/BandwidthInput/BandwidthInput';
import CompletionTimeout from '../compnents/CompletionTimeout/CompletionTimeout';
import YesNoDropdown from '../compnents/YesNoDropdown/YesNoDropdown';

import { MigrationPolicyConfigurationOption } from './constants';

export const getMigrationPolicyConfigurationOptions = (): MigrationPolicyConfigurationOption => {
  return {
    allowAutoConverge: {
      label: t('Auto converge'),
      component: YesNoDropdown,
      defaultValue: false,
    },
    allowPostCopy: {
      label: t('Post-copy'),
      component: YesNoDropdown,
      defaultValue: false,
    },
    completionTimeoutPerGiB: {
      label: t('Completion timeout'),
      description: t('(In seconds)'),
      component: CompletionTimeout,
      defaultValue: 0,
    },
    bandwidthPerMigration: {
      label: t('Bandwidth per migration'),
      description: t('To gain unlimited bandwidth, set to 0'),
      component: BandwidthInput,
      defaultValue: { value: 0, unit: BinaryUnit.Mi },
    },
  };
};
