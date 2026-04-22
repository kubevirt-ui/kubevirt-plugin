import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition } from '@patternfly/react-core';

const SysprepUnattendHelperPopup: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={t(
        'Unattend can be used to configure windows setup and can be picked up several times during windows setup/configuration.',
      )}
      footerContent={<ExternalLink href={documentationURL.SYSPREP} text={t('Learn more')} />}
      headerContent={t('Unattend.xml')}
      position={PopoverPosition.right}
    />
  );
};

export default SysprepUnattendHelperPopup;
