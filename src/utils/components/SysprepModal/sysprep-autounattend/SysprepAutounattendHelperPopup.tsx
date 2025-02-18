import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Content, ContentVariants, Popover } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const SysprepUnattendHelperPopup: FC = () => {
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
            <Button
              icon={<ExternalLinkSquareAltIcon />}
              iconPosition="right"
              isInline
              size="sm"
              variant="link"
            >
              <a href={documentationURL.SYSPREP} rel="noopener noreferrer" target="_blank">
                {t('Learn more')}
              </a>
            </Button>
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
        variant="link"
      />
    </Popover>
  );
};

export default SysprepUnattendHelperPopup;
