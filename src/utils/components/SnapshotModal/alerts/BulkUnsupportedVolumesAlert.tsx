import * as React from 'react';

import { V1VolumeSnapshotStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  FormGroup,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import SnapshotSupportLink from '../SnapshotSupportLink/SnapshotSupportLink';

type BulkUnsupportedVolumesAlertProps = {
  unsupportedVolumes: Record<string, V1VolumeSnapshotStatus[]>;
};

const BulkUnsupportedVolumesAlert: React.FC<BulkUnsupportedVolumesAlertProps> = ({
  unsupportedVolumes,
}) => {
  const { t } = useKubevirtTranslation();

  const volumesCount = Object.values(unsupportedVolumes).flat().length;

  if (volumesCount === 0) {
    return null;
  }

  return (
    <FormGroup fieldId="snapshot-unsupported-volumes-alert">
      <Alert
        actionLinks={
          <Stack hasGutter>
            <StackItem>
              {t('Edit the disks or contact your cluster admin for further details.', {
                count: volumesCount,
              })}
            </StackItem>
            <StackItem>
              <SnapshotSupportLink />
            </StackItem>
          </Stack>
        }
        title={t('The following {{count}} disks will not be included in the snapshot', {
          count: volumesCount,
        })}
        isExpandable
        isInline
        variant={AlertVariant.warning}
      >
        <Stack className="vm-disks-list" hasGutter>
          {Object.entries(unsupportedVolumes).map(([vmName, volumes]) => (
            <StackItem key={vmName}>
              <div>{vmName}</div>
              <List>
                {volumes?.map((vol) => (
                  <ListItem key={vol.name}>
                    <span className="pf-v6-u-font-weight-bold">{vol.name}</span> - {vol.reason}
                  </ListItem>
                ))}
              </List>
            </StackItem>
          ))}
        </Stack>
      </Alert>
    </FormGroup>
  );
};

export default BulkUnsupportedVolumesAlert;
