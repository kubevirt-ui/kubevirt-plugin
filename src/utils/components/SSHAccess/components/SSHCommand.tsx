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
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SSHCommand: React.FC<SSHCommandProps> = ({
  sshService: initialSSHService,
  sshServiceLoaded,
  vm,
  vmi,
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
        setSSHService(null);
      }

      if (newServiceType && newServiceType !== SERVICE_TYPES.NONE) {
        const newService = await createSSHService(vm, newServiceType, vmi);
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
    <DescriptionListGroup className="pf-c-description-list__group">
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH service type')}
      </DescriptionListTerm>

      <DescriptionListDescription className="pf-c-description-list__description">
        <Stack hasGutter>
          {sshServiceLoaded && !loading ? (
            <>
              <StackItem>
                <SSHServiceSelect
                  onSSHChange={onSSHChange}
                  sshService={sshService}
                  sshServiceLoaded={sshServiceLoaded}
                />
              </StackItem>

              {sshServiceRunning && (
                <StackItem>
                  <ClipboardCopy
                    clickTip={t('Copied')}
                    data-test="ssh-command-copy"
                    hoverTip={t('Copy to clipboard')}
                    isReadOnly
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
              <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
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
