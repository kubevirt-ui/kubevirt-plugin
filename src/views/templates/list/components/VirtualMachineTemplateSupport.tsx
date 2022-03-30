import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { SUPPORT_URL } from '../../utils/constants';

import './VirtualMachineTemplateSupport.scss';

const VirtualMachineTemplateSupport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {t('Supported operating systems are labeled below. ')}
      <Button
        variant="link"
        icon={<ExternalLinkAltIcon />}
        href={SUPPORT_URL}
        target="_blank"
        component="a"
        iconPosition="right"
        className="no-left-padding"
      >
        {t('Learn more about Red Hat support')}
      </Button>
    </>
  );
};

export default VirtualMachineTemplateSupport;
