import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Title } from '@patternfly/react-core';

import './DiskListTitle.scss';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title headingLevel="h2" className="disk-list-title">
      {t('Disks')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'The following information is provided by the OpenShift Virtualization operator.',
        )}
        position={PopoverPosition.right}
        helpIconClassName="title-help-text-icon"
      />
    </Title>
  );
};

export default DiskListTitle;
