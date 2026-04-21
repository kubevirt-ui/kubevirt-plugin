import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const SysprepUnattendHelperPopup: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <div data-test="sysprep-unattend-popover">
          <Trans ns="plugin__kubevirt-plugin">
            <Content component={ContentVariants.h6}>Unattend.xml</Content>
            <Content component={ContentVariants.p}>
              Unattend can be used to configure windows setup and can be picked up several times
              during windows setup/configuration.
            </Content>
            <ExternalLink href={documentationURL.SYSPREP} text={t('Learn more')} />
          </Trans>
        </div>
      }
      aria-label={t('Help')}
      hasAutoWidth
    >
      <Button
        aria-label={t('Help')}
        className="co-field-level-help"
        data-test-id="ssh-popover-button"
        icon={<OutlinedQuestionCircleIcon className="co-field-level-help__icon" />}
        isInline
        variant={ButtonVariant.link}
      />
    </Popover>
  );
};

export default SysprepUnattendHelperPopup;
