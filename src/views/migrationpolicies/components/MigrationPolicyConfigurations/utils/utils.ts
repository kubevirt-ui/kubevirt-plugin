import { documentationURL } from '@kubevirt-utils/constants/documentation';
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
      labelHelp: {
        helpInfo: documentationURL.MIGRATION_CONFIGURATION,
        helpText: t(
          'CompletionTimeoutPerGiB is the maximum number of seconds per GiB a migration is allowed to take. If a live-migration takes longer to migrate than this value multiplied by the size of the VMI, the migration will be cancelled, unless AllowPostCopy is true. Defaults to 800. For more info: ',
        ),
      },
    },
  };
};
