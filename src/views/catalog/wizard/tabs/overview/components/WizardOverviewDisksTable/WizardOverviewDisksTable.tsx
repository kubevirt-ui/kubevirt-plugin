import * as React from 'react';

import useWizardDisksTableData from '@catalog/wizard/tabs/disks/hooks/useWizardDisksTableData';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const WizardOverviewDisksTable: React.FC<{
  vm: V1VirtualMachine;
}> = React.memo(({ vm }) => {
  const [disks] = useWizardDisksTableData(vm);

  const { t } = useKubevirtTranslation();
  return (
    <DescriptionList columnModifier={{ default: '3Col' }} isInlineGrid>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.name}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Drive')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.drive}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Size')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.size}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
});
WizardOverviewDisksTable.displayName = 'WizardOverviewDisksTable';
