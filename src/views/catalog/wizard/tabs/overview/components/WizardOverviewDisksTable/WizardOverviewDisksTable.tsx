import * as React from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import useWizardDisksTableData from '@catalog/wizard/tabs/disks/hooks/useWizardDisksTableData';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

export const WizardOverviewDisksTable: React.FC<{
  isInlineGrid?: boolean;
  vm: V1VirtualMachine;
}> = React.memo(({ isInlineGrid, vm }) => {
  const [disks] = useWizardDisksTableData(vm);

  const { t } = useKubevirtTranslation();
  return (
    <DescriptionList
      className="pf-c-description-list"
      columnModifier={{ default: '3Col' }}
      isInlineGrid={isInlineGrid}
    >
      <WizardDescriptionItem
        description={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.name}</StackItem>
            ))}
          </Stack>
        }
        title={t('Name')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.drive}</StackItem>
            ))}
          </Stack>
        }
        title={t('Drive')}
      />
      <WizardDescriptionItem
        description={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{readableSizeUnit(disk.size)}</StackItem>
            ))}
          </Stack>
        }
        title={t('Size')}
      />
    </DescriptionList>
  );
});
WizardOverviewDisksTable.displayName = 'WizardOverviewDisksTable';
