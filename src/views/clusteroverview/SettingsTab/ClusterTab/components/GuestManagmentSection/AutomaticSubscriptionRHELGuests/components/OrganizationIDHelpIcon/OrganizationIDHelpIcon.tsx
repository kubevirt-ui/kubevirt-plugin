import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import { REDHAT_CONSOLE_URL } from '../../utils/constants';

const OrganizationIDHelpIcon: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Log into{' '}
          <Button component="a" href={REDHAT_CONSOLE_URL} isInline target="_blank" variant="link">
            Hybrid Cloud Console
          </Button>{' '}
          to track your Organization ID.
        </Trans>
      }
    />
  );
};

export default OrganizationIDHelpIcon;
