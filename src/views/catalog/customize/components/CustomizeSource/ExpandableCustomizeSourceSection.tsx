import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { CustomizeSource, CustomizeSourceProps } from './CustomizeSource';

export const ExpandableCustomizeSourceSection: React.FC<CustomizeSourceProps> = ({
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
  const [storageFieldsExpanded, setStorageFieldsExpanded] = React.useState<boolean>(
    !isBootSourceAvailable,
  );

  return (
    <Stack hasGutter>
      <StackItem>
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
            <Popover
              position={PopoverPosition.top}
              aria-label="Condition Popover"
              bodyContent={() => (
                <div>
                  {t(
                    'You can customize the Templates storage by overriding the original parameters',
                  )}
                </div>
              )}
            >
              <HelpIcon />
            </Popover>
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
