import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, Text, TextVariants } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import { SYSPREP_DOC_URL } from '../consts';

const SysprepUnattendHelperPopup: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <div data-test="sysprep-unattend-popover">
          <Trans ns="plugin__kubevirt-plugin">
            <Text component={TextVariants.h6}>Unattend.xml</Text>
            <Text component={TextVariants.p}>
              Unattend can be used to configure windows setup and can be picked up several times
              during windows setup/configuration.
            </Text>
            <Button
              icon={<ExternalLinkSquareAltIcon />}
              iconPosition="right"
              isInline
              isSmall
              variant="link"
            >
              <a href={SYSPREP_DOC_URL} rel="noopener noreferrer" target="_blank">
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
