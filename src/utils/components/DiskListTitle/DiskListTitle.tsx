import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Title } from '@patternfly/react-core';

import SearchItem from '../SearchItem/SearchItem';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2">
      <SearchItem id="disks">{t('Disks')}</SearchItem>
      <HelpTextIcon
        bodyContent={t(
          'The following information is provided by the OpenShift Virtualization operator.',
        )}
        helpIconClassName="title-help-text-icon"
        position={PopoverPosition.right}
      />
    </Title>
  );
};

export default DiskListTitle;
