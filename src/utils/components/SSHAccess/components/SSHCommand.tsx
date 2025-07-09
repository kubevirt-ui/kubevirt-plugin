import React, { useEffect, useState } from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  ClipboardCopy,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { SERVICE_TYPES } from '../constants';
import useSSHCommand, { isLoadBalancerBonded } from '../useSSHCommand';
import { addSSHSelectorLabelToVM } from '../utils';
import { createSSHService, deleteSSHService } from '../utils';

import SSHServiceSelect from './SSHServiceSelect';
import SSHServiceStateIcon from './SSHServiceState';

type SSHCommandProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
};

const SSHCommand: React.FC<SSHCommandProps> = ({
  sshService: initialSSHService,
  sshServiceLoaded,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [sshService, setSSHService] = useState<IoK8sApiCoreV1Service | null>();
  const { command, sshServiceRunning } = useSSHCommand(vm, sshService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: {
      group: VirtualMachineInstanceModel.apiGroup,
      kind: VirtualMachineInstanceModel.kind,
      version: VirtualMachineInstanceModel.apiVersion,
    },
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });

  const onSSHChange = async (newServiceType: SERVICE_TYPES) => {
    setLoading(true);

    try {
      if (sshService) {
        await deleteSSHService(sshService);
        setSSHService(null);
      }

      if (newServiceType && newServiceType !== SERVICE_TYPES.NONE) {
        await addSSHSelectorLabelToVM(vm, vmi, vm?.metadata?.name);

        const newService = await createSSHService(vm, newServiceType);
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

  const showBondingWarning =
    sshService?.spec?.type === SERVICE_TYPES.LOAD_BALANCER && !isLoadBalancerBonded(sshService);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-v6-u-font-size-xs">
        {t('SSH service type')}
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          {sshServiceLoaded && !loading ? (
            <>
              <StackItem>
                <Flex direction={{ default: 'row' }}>
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <SSHServiceSelect
                      onSSHChange={onSSHChange}
                      sshService={sshService}
                      sshServiceLoaded={sshServiceLoaded}
                    />
                  </FlexItem>

                  <SSHServiceStateIcon
                    sshService={sshService}
                    sshServiceLoaded={sshServiceLoaded}
                  />
                </Flex>
              </StackItem>

              {sshServiceRunning && !showBondingWarning && (
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
