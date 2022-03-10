import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';

import SnapshotSupportLink from '../SnapshotSupportLink/SnapshotSupportLink';

const NoSupportedVolumesAlert: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title={t('No disks found to include in the snapshot')}
    >
      <Stack hasGutter>
        <StackItem>
          <p>{t('Auto detach hot plugged disks are not included in the snapshot.')}</p>
          <p>
            {t(
              'Only disks with a snapshot-supported storage class defined are included in snapshots. No such disks were found.',
            )}
          </p>
          <p>
            {t(
              'To take a snapshot you can either edit an existing disk to add a snapshot-supported storage class or add a new disk with a compatible storage class defined. For further details, please contact your cluster admin.',
            )}
          </p>
        </StackItem>
        <StackItem>
          <SnapshotSupportLink />
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default NoSupportedVolumesAlert;
