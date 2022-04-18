import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';

import { PermissionsItem } from './PermissionsItem';

import './PermissionsCardPopover.scss';

type PermissionsCardPopoverProps = {
  capabilitiesData: { taskName: string; isLoading: boolean; allowed: boolean }[];
};

export const PermissionsCardPopover: React.FC<PermissionsCardPopoverProps> = ({
  capabilitiesData,
}) => {
  const { t } = useKubevirtTranslation();

  const permissionsItems = React.useMemo(
    () =>
      capabilitiesData.map((task) => (
        <PermissionsItem
          task={task.taskName}
          capability={task.allowed}
          isLoading={task.isLoading}
          key={task.taskName}
        />
      )),
    [capabilitiesData],
  );

  const bodyContent = (
    <>
      <div className="kv-permissions-card__popover-table-header">
        <span>{t('Task')}</span>
        <span>{t('Capability')}</span>
      </div>
      {permissionsItems}
    </>
  );

  return (
    <Popover
      position={PopoverPosition.top}
      headerContent={<>{t('Permissions')}</>}
      bodyContent={bodyContent}
      maxWidth="600px"
    >
      <Button
        id="virtualization-overview-permissions-popover-btn"
        className="pf-m-link--align-left"
        variant="link"
      >
        {t('Access Control')}
      </Button>
    </Popover>
  );
};
