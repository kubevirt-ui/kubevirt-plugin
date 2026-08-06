import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import SearchItem from '../SearchItem/SearchItem';

type DiskListTitleProps = {
  className?: string;
};

const DiskListTitle: FC<DiskListTitleProps> = ({ className }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2" className={className}>
      <SearchItem id="disks">{t('Disks')}</SearchItem>
    </Title>
  );
};

export default DiskListTitle;
