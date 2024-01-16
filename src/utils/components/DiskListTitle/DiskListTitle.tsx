import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import SearchItem from '../SearchItem/SearchItem';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2">
      <SearchItem id="disks">{t('Disks')}</SearchItem>
    </Title>
  );
};

export default DiskListTitle;
