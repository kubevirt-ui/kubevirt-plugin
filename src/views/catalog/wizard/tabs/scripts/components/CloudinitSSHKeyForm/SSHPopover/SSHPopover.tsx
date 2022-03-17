import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, Text, TextVariants } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './ssh-popover.scss';

const SSHPopover: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      aria-label={t('Help')}
      bodyContent={
        <div data-test="ssh-popover">
          <Trans t={t} ns="plugin__kubevirt-plugin">
            <Text component={TextVariants.h6}>Remember authorized SSH key</Text>
            <Text component={TextVariants.p}>
              Store the key in a project secret. Suggest the key next time you create a virtual
              machine.
            </Text>
            <Text component={TextVariants.p}>
              The key will be stored after the machine is created
            </Text>
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

export default SSHPopover;
