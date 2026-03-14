import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { Flex, FlexItem, Label } from '@patternfly/react-core';

type DiskNameCellProps = {
  row: DiskRowDataLayout;
  wrapper?: (children: ReactNode) => ReactNode;
};

const DiskLabel: FC<{ text: string }> = ({ text }) => (
  <FlexItem>
    <Label color="blue" variant="filled">
      {text}
    </Label>
  </FlexItem>
);

const DiskNameCell: FC<DiskNameCellProps> = ({ row, wrapper }) => {
  const { t } = useKubevirtTranslation();

  const content = (
    <Flex>
      <FlexItem>{row?.name ?? NO_DATA_DASH}</FlexItem>
      {row?.isBootDisk && <DiskLabel text={t('bootable')} />}
      {row?.isEnvDisk && <DiskLabel text={t('environment disk')} />}
    </Flex>
  );

  return wrapper ? <>{wrapper(content)}</> : content;
};

export default DiskNameCell;
