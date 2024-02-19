import React, { FC } from 'react';
import classnames from 'classnames';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import VirtctlSSHCommandClipboardCopy from './VirtctlSSHCommandClipboardCopy';

import './ConsoleOverVirtctl.scss';

type ConsoleOverVirtctlProps = {
  vm: V1VirtualMachine;
};

const ConsoleOverVirtctl: FC<ConsoleOverVirtctlProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  return (
    <DescriptionListGroup className="pf-c-description-list__group">
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH using virtctl')}{' '}
        <Popover
          bodyContent={
            <>
              <div>
                {t(
                  'SSH access using the virtctl command is possible only when the API server is reachable.',
                )}
              </div>
              <br />
              <Grid>
                <GridItem span={3}>{t('Example: ')}</GridItem>
                <GridItem id="ssh-using-virtctl--example" span={9}>
                  {getConsoleVirtctlCommand(vm)}
                </GridItem>
              </Grid>
            </>
          }
          aria-label={'Help'}
          minWidth="585px" // FIX
          position="right"
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>

      <DescriptionListDescription
        className={classnames('pf-c-description-list__description', 'sshcommand-body')}
      >
        <VirtctlSSHCommandClipboardCopy vm={vm} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ConsoleOverVirtctl;
