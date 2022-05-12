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
      aria-label={t('Help')}
      bodyContent={
        <div data-test="sysprep-unattend-popover">
          <Trans ns="plugin__kubevirt-plugin">
            <Text component={TextVariants.h6}>Unattend.xml</Text>
            <Text component={TextVariants.p}>
              Unattend can be used to configure windows setup and can be picked up several times
              during windows setup/configuration.
            </Text>
            <Button
              isSmall
              isInline
              variant="link"
              icon={<ExternalLinkSquareAltIcon />}
              iconPosition="right"
            >
              <a href={SYSPREP_DOC_URL} target="_blank" rel="noopener noreferrer">
                {t('Learn more')}
              </a>
            </Button>
          </Trans>
        </div>
      }
      hasAutoWidth
    >
      <Button
        aria-label={t('Help')}
        variant="link"
        isInline
        className="co-field-level-help"
        data-test-id="ssh-popover-button"
      >
        <OutlinedQuestionCircleIcon className="co-field-level-help__icon" />
      </Button>
    </Popover>
  );
};

export default SysprepUnattendHelperPopup;
