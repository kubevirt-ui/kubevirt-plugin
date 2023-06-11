import * as React from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClipboardCopy,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { getConsoleVirtctlCommand } from '../utils';

type ConsoleOverVirtctlProps = {
  userName?: string;
  vmName: string;
  vmNamespace: string;
};

const ConsoleOverVirtctl: React.FC<ConsoleOverVirtctlProps> = ({
  userName,
  vmName,
  vmNamespace,
}) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH using virtctl')}{' '}
        <Popover
          bodyContent={t(
            'SSH access using the virtctl command is possible only when the API server is reachable.',
          )}
          aria-label={'Help'}
          position="right"
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>

      <DescriptionListDescription className="sshcommand-body">
        <ClipboardCopy
          clickTip={t('Copied')}
          data-test="ssh-over-virtctl"
          hoverTip={t('Copy to clipboard')}
          isReadOnly
        >
          {getConsoleVirtctlCommand(userName, vmName, vmNamespace)}
        </ClipboardCopy>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ConsoleOverVirtctl;
