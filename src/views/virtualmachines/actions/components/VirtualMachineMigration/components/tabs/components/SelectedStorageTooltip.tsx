import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { Table, TableVariant, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { MAX_ROWS_VIEW_MORE } from './constants';

import './selected-storage-tooltip.scss';

type SelectedStorageTooltipProps = {
  vms: V1VirtualMachine[];
};

const SelectedStorageTooltip: FC<SelectedStorageTooltipProps> = ({ children, vms }) => {
  const [showMore, setShowMore] = useState(false);

  const { t } = useKubevirtTranslation();

  const rows = vms
    ?.map((vm) => {
      const vmVolumes = getVolumes(vm);

      return vmVolumes.map((volume) => ({ diskName: volume.name, vmName: getName(vm) }));
    })
    .flat();

  return (
    <Popover
      bodyContent={
        <div className="selected-storage-tooltip">
          <Table borders={false} variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th>{t('VirtualMachine')}</Th>
                <Th>{t('Volume name')}</Th>
              </Tr>
            </Thead>
            {rows.slice(0, showMore ? rows.length : MAX_ROWS_VIEW_MORE).map((row) => (
              <Tr key={`${row.vmName}-${row.diskName}`}>
                <Td>{row.vmName}</Td>
                <Td>{row.diskName}</Td>
              </Tr>
            ))}
          </Table>

          {rows.length > MAX_ROWS_VIEW_MORE && (
            <Button onClick={() => setShowMore((prev) => !prev)} variant={ButtonVariant.link}>
              {showMore ? t('Hide') : t('View more')}
            </Button>
          )}
        </div>
      }
      hasAutoWidth
      triggerAction="hover"
    >
      <Button disabled isInline variant={ButtonVariant.link}>
        {children}
      </Button>
    </Popover>
  );
};

export default SelectedStorageTooltip;
