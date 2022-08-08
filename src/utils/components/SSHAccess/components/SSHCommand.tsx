import React, { useEffect, useState } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  ClipboardCopy,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import useSSHCommand from '../useSSHCommand';
import { createSSHService, deleteSSHService } from '../utils';

import SSHCheckbox from './SSHCheckbox';

type SSHCommandProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
};

const SSHCommand: React.FC<SSHCommandProps> = ({
  vmi,
  vm,
  sshService: initialSSHService,
  sshServiceLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  const [sshService, setSSHService] = useState<IoK8sApiCoreV1Service>();
  const { command, sshServiceRunning } = useSSHCommand(vmi, sshService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const onSSHChange = (enableSSH: boolean) => {
    setLoading(true);

    const request = enableSSH
      ? createSSHService(vm, vmi).then(setSSHService)
      : deleteSSHService(sshService).then(() => setSSHService(undefined));

    request.catch(setError).finally(() => setLoading(false));
  };

  useEffect(() => {
    setSSHService(initialSSHService);
    setError(undefined);
  }, [initialSSHService]);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH over NodePort')}{' '}
        <Popover
          aria-label={'Help'}
          position="right"
          bodyContent={() =>
            t(
              'This option allows access through any SSH client via a NodePort Service. Additional network ports will be allocated. The node must be accessible from the outside network.',
            )
          }
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          <StackItem>
            <SSHCheckbox
              vmName={vm?.metadata?.name}
              sshServiceRunning={sshServiceRunning}
              setSSHServiceRunning={onSSHChange}
              isDisabled={loading}
            />
          </StackItem>
          {sshServiceLoaded && !loading ? (
            sshServiceRunning && (
              <StackItem>
                <ClipboardCopy
                  isReadOnly
                  data-test="ssh-command-copy"
                  clickTip={t('Copied')}
                  hoverTip={t('Copy to clipboard')}
                >
                  {command}
                </ClipboardCopy>
              </StackItem>
            )
          ) : (
            <Loading />
          )}
          {error && (
            <StackItem>
              <Alert variant={AlertVariant.danger} title={t('Error')} isInline>
                {error?.message}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SSHCommand;
