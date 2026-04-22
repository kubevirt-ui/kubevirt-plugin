import React, { FC, memo } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

type DisksReviewTableProps = {
  disks: DiskRowDataLayout[];
};

const DisksReviewTable: FC<DisksReviewTableProps> = memo(({ disks }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList columnModifier={{ default: '3Col' }}>
      <DescriptionItem
        descriptionData={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.name}</StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Name')}
      />
      <DescriptionItem
        descriptionData={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{disk.drive}</StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Drive')}
      />
      <DescriptionItem
        descriptionData={
          <Stack>
            {disks.map((disk) => (
              <StackItem key={disk.name}>{readableSizeUnit(disk.size)}</StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Size')}
      />
    </DescriptionList>
  );
});

DisksReviewTable.displayName = 'DisksReviewTable';

export default DisksReviewTable;
