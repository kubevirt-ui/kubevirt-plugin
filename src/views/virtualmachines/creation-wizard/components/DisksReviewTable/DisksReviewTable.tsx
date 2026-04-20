import React, { FCC, memo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';
import { WizardDescriptionItem } from '@virtualmachines/creation-wizard/components/WizardDescriptionItem';

type DiskReviewTableProps = {
  disks: DiskRowDataLayout[];
};

const DisksReviewTable: FCC<DiskReviewTableProps> = memo(({ disks }) => {
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

export default DisksReviewTable;
