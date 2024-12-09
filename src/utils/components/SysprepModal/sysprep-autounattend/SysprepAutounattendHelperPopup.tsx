import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, Text, TextVariants } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const SysprepUnattendHelperPopup: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <div data-test="sysprep-autounattend-popover">
          <Trans ns="plugin__kubevirt-plugin">
            <Text component={TextVariants.h6}>Autounattend.xml</Text>
            <Text component={TextVariants.p}>
              Autounattend will be picked up automatically during windows installation. it can be
              used with destructive actions such as disk formatting. Autounattend will only be used
              once during installation.
            </Text>
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
        isInline
        variant="link"
      >
        <OutlinedQuestionCircleIcon className="co-field-level-help__icon" />
      </Button>
    </Popover>
  );
};

export default SysprepUnattendHelperPopup;
