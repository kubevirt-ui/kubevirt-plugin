import React, { FC, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { CustomizeSource, CustomizeSourceProps } from './CustomizeSource';

import './ExpandableCustomizeSourceSection.scss';

export const ExpandableCustomizeSourceSection: FC<CustomizeSourceProps> = ({
  diskSource,
  setDiskSource,
  template,
  withDrivers,
  setDrivers,
  cdSource,
  setCDSource,
  diskUpload,
  cdUpload,
  isBootSourceAvailable,
}) => {
  const { t } = useKubevirtTranslation();
  const [storageFieldsExpanded, setStorageFieldsExpanded] = useState<boolean>(
    !isBootSourceAvailable,
  );

  return (
    <Stack hasGutter>
      <StackItem className="expandable-customize-source-section__stack-item-storage">
        <Flex>
          <FlexItem spacer={{ default: 'spacerNone' }}>
            <ExpandableSectionToggle
              data-test-id="expandable-customize-source-section"
              isExpanded={storageFieldsExpanded}
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
      </StackItem>
      <StackItem>
        <ExpandableSection
          data-test-id="expandable-storage-section"
          isExpanded={storageFieldsExpanded}
          isDetached
          isIndented
        >
          <CustomizeSource
            diskSource={diskSource}
            setDiskSource={setDiskSource}
            template={template}
            withDrivers={withDrivers}
            setDrivers={setDrivers}
            cdSource={cdSource}
            setCDSource={setCDSource}
            diskUpload={diskUpload}
            cdUpload={cdUpload}
            isBootSourceAvailable={isBootSourceAvailable}
          />
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};
