import * as React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Title } from '@patternfly/react-core';

const FilesystemListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2" className="title">
      {t('File systems')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'The following information regarding how the disks are partitioned is provided by the guest agent.',
        )}
        position={PopoverPosition.right}
        helpIconClassName="title-help-text-icon"
      />
    </Title>
  );
};

export default FilesystemListTitle;
