import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { getInterfaces, PASST_BINDING_NAME } from '@kubevirt-utils/resources/vm';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Content,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import VirtctlDisabled from './VirtctlDisabled';
import VirtctlSSHCommandClipboardCopy from './VirtctlSSHCommandClipboardCopy';

import './ConsoleOverVirtctl.scss';

type ConsoleOverVirtctlProps = {
  vm: V1VirtualMachine;
};

const ConsoleOverVirtctl: FC<ConsoleOverVirtctlProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const [isNamespaceManagedByUDN] = useNamespaceUDN(getNamespace(vm));
  const usesPasst = getInterfaces(vm)?.some((iface) => iface?.binding?.name === PASST_BINDING_NAME);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-v6-u-font-size-xs">
        <Content className="pf-v6-u-disabled-color-100" component="p">
          {t('SSH using virtctl')}{' '}
          <Popover
            bodyContent={(hide) => (
              <PopoverContentWithLightspeedButton
                content={
                  <>
                    <br />
                    <Trans t={t}>
                      <div>
                        Open an SSH connection with the VM using the cluster API server. You must be
                        able to access the API server and have virtctl command line tool installed.
                      </div>
                      <br />
                      <div>
                        For more details, see{' '}
                        <ExternalLink href={documentationURL.VIRTCTL_CLI}>
                          Installing virtctl
                        </ExternalLink>{' '}
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
                hide={hide}
                obj={vm}
                promptType={OLSPromptType.SSH_USING_VIRTCTL}
              />
            )}
            aria-label="Help"
            className="virtctl-popover"
            position="right"
          >
            <HelpIcon />
          </Popover>
        </Content>
      </DescriptionListTerm>
      <DescriptionListDescription>
        {isNamespaceManagedByUDN && !usesPasst ? (
          <VirtctlDisabled cluster={getCluster(vm)} namespace={getNamespace(vm)} />
        ) : (
          <VirtctlSSHCommandClipboardCopy
            isNamespaceManagedByUDN={isNamespaceManagedByUDN}
            vm={vm}
          />
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ConsoleOverVirtctl;
