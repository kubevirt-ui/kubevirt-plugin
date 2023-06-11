import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Title } from '@patternfly/react-core';

const FileSystemTableTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2">
      {t('File systems')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'The following information regarding how the disks are partitioned is provided by the guest agent.',
        )}
        helpIconClassName="title-help-text-icon"
        position={PopoverPosition.right}
      />
    </Title>
  );
};

export default FileSystemTableTitle;
