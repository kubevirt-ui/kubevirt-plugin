import React, { FC, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Skeleton,
} from '@patternfly/react-core';

import { useDrawerContext } from '../hooks/useDrawerContext';

import { CustomizeSource } from './CustomizeSource/CustomizeSource';

const StorageSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { template, templateDataLoaded, vm } = useDrawerContext();

  const [storageFieldsExpanded, setStorageFieldsExpanded] = useState<boolean>(true);

  const loaded = vm && templateDataLoaded;
  return (
    <>
      <Flex>
        <FlexItem spacer={{ default: 'spacerNone' }}>
          <ExpandableSectionToggle
            data-test-id="expandable-customize-source-section"
            isExpanded={loaded && storageFieldsExpanded}
            onToggle={() => setStorageFieldsExpanded(!storageFieldsExpanded)}
          >
            {t('Storage')}
          </ExpandableSectionToggle>
        </FlexItem>
        <FlexItem>
          <HelpTextIcon
            bodyContent={t(
              'You can customize the Templates storage by overriding the original parameters',
            )}
          />
        </FlexItem>
      </Flex>
      <ExpandableSection
        data-test-id="expandable-storage-section"
        isDetached
        isExpanded={storageFieldsExpanded}
        isIndented
      >
        {loaded ? <CustomizeSource template={template} /> : <Skeleton />}
      </ExpandableSection>
    </>
  );
};

export default StorageSection;
