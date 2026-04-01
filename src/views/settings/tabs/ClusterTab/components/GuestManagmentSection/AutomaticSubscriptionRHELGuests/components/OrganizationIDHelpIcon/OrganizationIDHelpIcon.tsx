import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Button, ButtonVariant } from '@patternfly/react-core';

import { REDHAT_CONSOLE_URL } from '../../utils/constants';

const OrganizationIDHelpIcon: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Log into{' '}
              <Button
                component="a"
                href={REDHAT_CONSOLE_URL}
                isInline
                target="_blank"
                variant={ButtonVariant.link}
              >
                Hybrid Cloud Console
              </Button>{' '}
              to track your Organization ID.
            </Trans>
          }
          hide={hide}
          promptType={OLSPromptType.ORGANIZATION_ID}
        />
      )}
    />
  );
};

export default OrganizationIDHelpIcon;
