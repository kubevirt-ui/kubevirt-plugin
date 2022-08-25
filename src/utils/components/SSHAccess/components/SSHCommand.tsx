import React, { useEffect, useState } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, ClipboardCopy } from '@patternfly/react-core';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

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
        {t('SSH over NodePort')}
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          <StackItem>
            <SSHCheckbox
              vmName={vm?.metadata?.name}
              sshServiceRunning={!!sshService}
              setSSHServiceRunning={onSSHChange}
              isDisabled={!sshServiceLoaded}
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
