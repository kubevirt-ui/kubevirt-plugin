import { type JSX } from 'react';

import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DescriptionList } from '@patternfly/react-core';

import { migrationPolicySpecKeys } from '../../../../../utils/constants';
import {
  getBandwidthPerMigrationText,
  getBooleanText,
  getCompletionTimeoutText,
} from '../../../../../utils/utils';

type MigrationPolicyConfigurationsProps = {
  mp: V1alpha1MigrationPolicy;
};

const MigrationPolicyConfigurations = ({ mp }: MigrationPolicyConfigurationsProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const hasOwnPropertySpec = (key: string): boolean => key in (mp?.spec ?? {});

  return (
    <DescriptionList>
      <DescriptionItem
        bodyContent={t(
          'BandwidthPerMigration limits the amount of network bandwith live migrations are allowed to use. The value is in quantity per second. Defaults to 0 (no limit).',
        )}
        descriptionData={
          hasOwnPropertySpec(migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION)
            ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
            : NO_DATA_DASH
        }
        descriptionHeader={t('Bandwidth per migration')}
        isPopover
        moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
      />
      <DescriptionItem
        bodyContent={t(
          'AllowAutoConverge allows the platform to compromise performance/availability of VMIs to guarantee successful VMI live migrations. Defaults to false.',
        )}
        descriptionData={
          hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE)
            ? getBooleanText(mp?.spec?.allowAutoConverge)
            : NO_DATA_DASH
        }
        descriptionHeader={t('Auto converge')}
        isPopover
        moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
      />
      <DescriptionItem
        bodyContent={t(
          'AllowPostCopy enables post-copy live migrations. Such migrations allow even the busiest VMIs to successfully live-migrate. However, events like a network failure can cause a VMI crash. If set to true, migrations will still start in pre-copy, but switch to post-copy when CompletionTimeoutPerGiB triggers. Defaults to false.',
        )}
        descriptionData={
          hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_POST_COPY)
            ? getBooleanText(mp?.spec?.allowPostCopy)
            : NO_DATA_DASH
        }
        descriptionHeader={t('Post-copy')}
        isPopover
        moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
      />
      <DescriptionItem
        bodyContent={t(
          'CompletionTimeoutPerGiB is the maximum number of seconds per GiB a migration is allowed to take. If a live-migration takes longer to migrate than this value multiplied by the size of the VMI, the migration will be cancelled, unless AllowPostCopy is true. Defaults to 800.',
        )}
        descriptionData={
          hasOwnPropertySpec(migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB)
            ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
            : NO_DATA_DASH
        }
        descriptionHeader={t('Completion timeout')}
        isPopover
        moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
      />
    </DescriptionList>
  );
};

export default MigrationPolicyConfigurations;
