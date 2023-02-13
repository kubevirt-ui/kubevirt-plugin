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
  vmName: string;
  vmNamespace: string;
  userName?: string;
};

const ConsoleOverVirtctl: React.FC<ConsoleOverVirtctlProps> = ({
  vmName,
  vmNamespace,
  userName,
}) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH using virtctl')}{' '}
        <Popover
          aria-label={'Help'}
          position="right"
          bodyContent={t(
            'SSH access using the virtctl command is possible only when the API server is reachable.',
          )}
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>

      <DescriptionListDescription className="sshcommand-body">
        <ClipboardCopy
          isReadOnly
          data-test="ssh-over-virtctl"
          clickTip={t('Copied')}
          hoverTip={t('Copy to clipboard')}
        >
          {getConsoleVirtctlCommand(vmName, vmNamespace, userName)}
        </ClipboardCopy>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ConsoleOverVirtctl;
