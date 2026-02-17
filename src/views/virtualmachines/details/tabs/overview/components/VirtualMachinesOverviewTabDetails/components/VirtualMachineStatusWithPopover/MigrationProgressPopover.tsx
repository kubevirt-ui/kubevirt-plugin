import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { dateTimeFormatter } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';
import { formatElapsedTime, getElapsedTimeInSeconds } from '@kubevirt-utils/utils/elapsedTime';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';

import { getMigrationPhaseIcon } from './utils';

type MigrationProgressPopoverProps = React.PropsWithChildren<{
  vmi: V1VirtualMachineInstance;
}>;

const MigrationProgressPopover: React.FC<MigrationProgressPopoverProps> = ({ children, vmi }) => {
  const { t } = useKubevirtTranslation();
  const vmim = useVirtualMachineInstanceMigration(vmi);
  const Icon = getMigrationPhaseIcon(vmim?.status?.phase);
  const startTimestamp = vmi?.status?.migrationState?.startTimestamp;
  const endTimestamp = vmi?.status?.migrationState?.endTimestamp;

  const initialElapsedSeconds = useMemo(
    () => getElapsedTimeInSeconds(startTimestamp),
    [startTimestamp],
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);

  useEffect(() => {
    setElapsedSeconds(initialElapsedSeconds);
  }, [initialElapsedSeconds]);

  useEffect(() => {
    if (!startTimestamp || endTimestamp) return;

    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedTimeInSeconds(startTimestamp));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTimestamp, endTimestamp]);

  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            <b>{t('Phase')}</b> <Icon /> {vmim?.status?.phase}
          </StackItem>
          <StackItem>
            <b>{t('Started')}</b>{' '}
            {vmi?.status?.migrationState?.startTimestamp &&
              dateTimeFormatter.format(new Date(vmi?.status?.migrationState?.startTimestamp))}
          </StackItem>
          <StackItem>
            <b>{t('Elapsed time')}</b> {formatElapsedTime(t, elapsedSeconds)}
          </StackItem>
          <StackItem>
            <b>{t('Policy')}</b>{' '}
            {vmi?.status?.migrationState?.migrationPolicyName ? (
              <MulticlusterResourceLink
                cluster={getCluster(vmi)}
                groupVersionKind={MigrationPolicyModelGroupVersionKind}
                name={vmi.status.migrationState.migrationPolicyName}
              />
            ) : (
              <MutedTextSpan text="No MigrationPolicy" />
            )}
          </StackItem>
          <StackItem>
            <Link
              to={`${getResourceUrl({
                model: VirtualMachineModel,
                resource: vmi,
              })}/metrics?migration`}
            >
              {t('Migration metrics')}
            </Link>
          </StackItem>
        </Stack>
      }
      headerContent={t('VirtualMachine migration')}
      position={PopoverPosition.right}
    >
      <>{children}</>
    </Popover>
  );
};

export default MigrationProgressPopover;
