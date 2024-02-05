import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

import { ACTIVATION_KEYS_DOCUMENTATION_URL, ACTIVATION_KEYS_URL } from '../../utils/constants';

const ActivationKeyHelpIcon: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={
        <>
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            An activation key is a preshared authentication token that enables authorized users to
            register and configure systems. Organization administrators can browse to{' '}
            <Button
              component="a"
              href={ACTIVATION_KEYS_URL}
              isInline
              target="_blank"
              variant={ButtonVariant.link}
            >
              Activation keys
            </Button>{' '}
            to track an existing Activation key or use the Create activation key button to create a
            new one.
          </Trans>
          <br />
          <br />
          <ExternalLink href={ACTIVATION_KEYS_DOCUMENTATION_URL} text={t('Read more')} />
        </>
      }
    />
  );
};

export default ActivationKeyHelpIcon;
