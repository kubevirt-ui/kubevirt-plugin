import React, { FCC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const SysprepUnattendHelperPopup: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <div data-test="sysprep-autounattend-popover">
          <Trans ns="plugin__kubevirt-plugin">
            <Content component={ContentVariants.h6}>Autounattend.xml</Content>
            <Content component={ContentVariants.p}>
              Autounattend will be picked up automatically during windows installation. it can be
              used with destructive actions such as disk formatting. Autounattend will only be used
              once during installation.
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
