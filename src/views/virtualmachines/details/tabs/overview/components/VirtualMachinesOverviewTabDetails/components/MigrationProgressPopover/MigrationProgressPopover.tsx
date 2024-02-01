import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { dateTimeFormatter } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';

import { getMigrationPhaseIcon } from './utils';

type MigrationProgressPopoverProps = React.PropsWithChildren<{
  vmi: V1VirtualMachineInstance;
}>;
const MigrationProgressPopover: React.FC<MigrationProgressPopoverProps> = ({ children, vmi }) => {
  const { t } = useKubevirtTranslation();
  const vmim = useVirtualMachineInstanceMigration(vmi);
  const Icon = getMigrationPhaseIcon(vmim?.status?.phase);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (vmi?.status?.migrationState?.startTimestamp) {
      const interval = setInterval(() => {
        setSeconds((sec) => {
          if (sec + 1 === 60) {
            setMinutes((min) => min + 1);
            return 0;
          }
          return sec + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    if (vmi?.status?.migrationState?.endTimestamp) {
      setSeconds(0);
      setMinutes(0);
    }
  }, [vmi?.status?.migrationState?.endTimestamp, vmi?.status?.migrationState?.startTimestamp]);
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
            <b>{t('Elapsed time')}</b>{' '}
            {t('{{minutes}}{{seconds}} seconds', {
              minutes: minutes ? `${minutes} minutes, ` : null,
              seconds,
            })}
          </StackItem>
          <StackItem>
            <b>{t('Policy')}</b>{' '}
            {vmi?.status?.migrationState?.migrationPolicyName ? (
              <ResourceLink
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
      headerContent={'VirtualMachine migration'}
      position={PopoverPosition.right}
    >
      <>{children}</>
    </Popover>
  );
};

export default MigrationProgressPopover;
