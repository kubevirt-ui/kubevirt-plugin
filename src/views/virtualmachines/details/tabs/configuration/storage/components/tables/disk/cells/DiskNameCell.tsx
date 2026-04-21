import React, { FC, useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { NameWithPercentages } from '@kubevirt-utils/resources/vm/hooks/types';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import {
  Button,
  ButtonVariant,
  Label,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { HotplugLabel } from '../HotplugLabel';
import ISOBadge from '../ISOBadge';

type DiskNameCellProps = {
  provisioningPercentages: NameWithPercentages;
  row: DiskRowDataLayout;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskNameCell: FC<DiskNameCellProps> = ({ provisioningPercentages, row, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { isBootDisk, isEnvDisk, name, source } = row;

  const provisioningPercentage = provisioningPercentages?.[source];
  const hasProvisioning = provisioningPercentage != null;

  const displayName = useMemo(() => {
    const disks = getDisks(vm) ?? [];
    const foundDisk = disks.find((disk) => disk.name === name);
    const cdrom = foundDisk && isCDROMDisk(foundDisk);
    return cdrom ? t('CD-ROM') : name;
  }, [vm, name, t]);

  const provisioningLabel = hasProvisioning
    ? t('{{name}}, provisioning {{percentage}}', {
        name: displayName,
        percentage: provisioningPercentage,
      })
    : undefined;

  return (
    <Stack data-test-id={`disk-${name}`}>
      <StackItem>
        {hasProvisioning ? (
          <Popover
            aria-label={provisioningLabel}
            bodyContent={provisioningLabel}
            position={PopoverPosition.right}
          >
            <Button
              aria-label={provisioningLabel}
              className="provisioning-popover-button"
              isInline
              variant={ButtonVariant.link}
            >
              {displayName}
            </Button>
          </Popover>
        ) : (
          displayName
        )}{' '}
        <HotplugLabel diskName={name} vm={vm} vmi={vmi} />
        <ISOBadge diskName={name} vm={vm} />
      </StackItem>
      {isBootDisk && (
        <StackItem>
          <Label className="disk-row-label-bootable" color="blue" variant="filled">
            {t('bootable')}
          </Label>
        </StackItem>
      )}
      {isEnvDisk && (
        <StackItem>
          <Label color="blue" variant="filled">
            {t('environment disk')}
          </Label>
        </StackItem>
      )}
    </Stack>
  );
};

export default DiskNameCell;
