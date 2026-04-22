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
        'Autounattend will be picked up automatically during windows installation. it can be used with destructive actions such as disk formatting. Autounattend will only be used once during installation.',
      )}
      footerContent={<ExternalLink href={documentationURL.SYSPREP} text={t('Learn more')} />}
      headerContent={t('Autounattend.xml')}
      position={PopoverPosition.right}
    />
  );
};

export default SysprepUnattendHelperPopup;
