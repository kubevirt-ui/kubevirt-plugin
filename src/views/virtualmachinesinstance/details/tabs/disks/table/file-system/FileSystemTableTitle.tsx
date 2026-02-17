import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, FlexItem, PopoverPosition, Title } from '@patternfly/react-core';

const FileSystemTableTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex>
      <FlexItem spacer={{ default: 'spacerXs' }}>
        <Title headingLevel="h2">{t('File systems')}</Title>
      </FlexItem>
      <FlexItem>
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t(
                'The following information regarding how the disks are partitioned is provided by the guest agent.',
              )}
              hide={hide}
              promptType={OLSPromptType.FILE_SYSTEMS}
            />
          )}
          position={PopoverPosition.right}
        />
      </FlexItem>
    </Flex>
  );
};

export default FileSystemTableTitle;
