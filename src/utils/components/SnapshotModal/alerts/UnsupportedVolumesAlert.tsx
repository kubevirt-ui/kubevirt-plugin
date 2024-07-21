import * as React from 'react';

import { V1VolumeSnapshotStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import SnapshotSupportLink from '../SnapshotSupportLink/SnapshotSupportLink';

type UnsupportedVolumesAlertProps = {
  unsupportedVolumes: V1VolumeSnapshotStatus[];
};

const UnsupportedVolumesAlert: React.FC<UnsupportedVolumesAlertProps> = ({
  unsupportedVolumes,
}) => {
  const { t } = useKubevirtTranslation();
  if (isEmpty(unsupportedVolumes)) {
    return null;
  }
  return (
    <FormGroup fieldId="snapshot-unsupported-volumes-alert">
      <Alert
        title={t('The following disk will not be included in the snapshot', {
          count: unsupportedVolumes?.length,
        })}
        isInline
        variant={AlertVariant.warning}
      >
        <Stack hasGutter>
          <StackItem>
            <Stack>
              {unsupportedVolumes?.map((vol) => (
                <StackItem key={vol.name}>
                  <strong>{vol.name}</strong> - {vol.reason}
                </StackItem>
              ))}
            </Stack>
          </StackItem>
          <StackItem>
            {t('Edit the disk or contact your cluster admin for further details.', {
              count: unsupportedVolumes?.length,
            })}
          </StackItem>
          <StackItem>
            <SnapshotSupportLink />
          </StackItem>
        </Stack>
      </Alert>
    </FormGroup>
  );
};

export default UnsupportedVolumesAlert;
