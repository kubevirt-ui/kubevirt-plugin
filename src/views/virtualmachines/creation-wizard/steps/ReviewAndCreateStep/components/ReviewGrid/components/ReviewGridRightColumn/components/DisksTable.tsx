import React, { FC, memo } from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import useWizardDisksTableData from '@catalog/wizard/tabs/disks/hooks/useWizardDisksTableData';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';

const DisksTable: FC = memo(() => {
  const vm = wizardVMSignal.value;
  const [disks] = useWizardDisksTableData(vm);

  const { t } = useKubevirtTranslation();
  return (
    <DescriptionList columnModifier={{ default: '3Col' }}>
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

export default DisksTable;
