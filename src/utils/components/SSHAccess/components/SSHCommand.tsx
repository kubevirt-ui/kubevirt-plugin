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
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { SERVICE_TYPES } from '../constants';
import useSSHCommand from '../useSSHCommand';
import { createSSHService, deleteSSHService } from '../utils';

import SSHServiceSelect from './SSHServiceSelect';

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
  const [sshService, setSSHService] = useState<IoK8sApiCoreV1Service | null>();
  const { command, sshServiceRunning } = useSSHCommand(vm, sshService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const onSSHChange = async (newServiceType: SERVICE_TYPES) => {
    setLoading(true);

    try {
      if (sshService) {
        await deleteSSHService(sshService);
      }

      if (newServiceType && newServiceType !== SERVICE_TYPES.NONE) {
        const newService = await createSSHService(vm, vmi, newServiceType);
        setSSHService(newService);
      }
    } catch (apiError) {
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSSHService(initialSSHService);
    setError(undefined);
  }, [initialSSHService]);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH service type')}
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          {sshServiceLoaded && !loading ? (
            <>
              <StackItem>
                <SSHServiceSelect
                  sshService={sshService}
                  sshServiceLoaded={sshServiceLoaded}
                  onSSHChange={onSSHChange}
                />
              </StackItem>

              {sshServiceRunning && (
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
              )}
            </>
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
