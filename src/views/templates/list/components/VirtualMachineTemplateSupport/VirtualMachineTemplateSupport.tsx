import React, { FC } from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import './VirtualMachineTemplateSupport.scss';

const VirtualMachineTemplateSupport: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('Supported operating systems are labeled below. ')}
      <Button
        className="no-left-padding"
        component="a"
        href={documentationURL.SUPPORT_URL}
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        target="_blank"
        variant="link"
      >
        {t('Learn more about Red Hat support')}
      </Button>
    </>
  );
};

export default VirtualMachineTemplateSupport;
