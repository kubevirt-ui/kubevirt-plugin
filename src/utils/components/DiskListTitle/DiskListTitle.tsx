import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, PopoverPosition, Title } from '@patternfly/react-core';

import SearchItem from '../SearchItem/SearchItem';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2">
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <SearchItem id="disks">{t('Disks')}</SearchItem>
        <HelpTextIcon
          bodyContent={t(
            'The following information is provided by the OpenShift Virtualization operator.',
          )}
          position={PopoverPosition.right}
        />
      </Flex>
    </Title>
  );
};

export default DiskListTitle;
