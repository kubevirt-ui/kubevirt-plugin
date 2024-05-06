import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

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
              <Trans t={t}>
                <div>
                  Open an SSH connection with the VM using the cluster API server. You must be able
                  to access the API server and have virtctl command line tool installed.
                </div>
                <br />
                <div>
                  For more details, see{' '}
                  <Link
                    to={
                      'https://docs.openshift.com/container-platform/4.15/virt/getting_started/virt-using-the-cli-tools.html'
                    }
                  >
                    Installing virtctl
                  </Link>{' '}
                  in Getting started with OpenShift Virtualization.
                </div>
              </Trans>
              <br />
              <Grid>
                <GridItem span={2}>{t('Example: ')}</GridItem>
                <GridItem id="ssh-using-virtctl--example" span={10}>
                  {getConsoleVirtctlCommand(vm)}
                </GridItem>
              </Grid>
            </>
          }
          aria-label="Help"
          className="virtctl-popover"
          position="right"
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>
      <DescriptionListDescription className="pf-c-description-list__description">
        <VirtctlSSHCommandClipboardCopy vm={vm} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ConsoleOverVirtctl;
