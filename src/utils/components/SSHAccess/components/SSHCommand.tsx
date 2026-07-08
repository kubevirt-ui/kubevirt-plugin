import React, { FC, useEffect, useState } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getVMIPod } from '@kubevirt-utils/resources/vmi/utils/pod';
import { getVMILabelForServiceSelector } from '@kubevirt-utils/resources/vmi/utils/services';
import { getCluster } from '@multicluster/helpers/selectors';
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
import { addSSHSelectorLabelToVM, createSSHService, deleteSSHService } from '../utils';

import SSHServiceSelect from './SSHServiceSelect';
import SSHServiceStateIcon from './SSHServiceState';

type SSHCommandProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceError?: Error;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
};

const SSHCommand: FC<SSHCommandProps> = ({
  sshService: initialSSHService,
  sshServiceError,
  sshServiceLoaded,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [sshService, setSSHService] = useState<IoK8sApiCoreV1Service | null>();
  const { command, sshServiceRunning } = useSSHCommand(vm, sshService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const {
    error: vmiAndPodsError,
    loaded: vmiAndPodsLoaded,
    pods,
    vmi,
  } = useVMIAndPodsForVM(getName(vm), getNamespace(vm), getCluster(vm));
  const loadError = sshServiceError || vmiAndPodsError;
  const pod = getVMIPod(vmi, pods);

  const onSSHChange = async (newServiceType: SERVICE_TYPES) => {
    setLoading(true);

    try {
      if (sshService) {
        await deleteSSHService(sshService);
        setSSHService(null);
      }

      if (newServiceType && newServiceType !== SERVICE_TYPES.NONE) {
        const labelSelector = getVMILabelForServiceSelector(pod, vm);
        await addSSHSelectorLabelToVM(vm, vmi, labelSelector);

        const newService = await createSSHService(vm, newServiceType, pod);
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

  const isLoaded = sshServiceLoaded && vmiAndPodsLoaded && !loading;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-v6-u-font-size-xs">
        {t('SSH service type')}
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          <StateHandler error={loadError} hasData={false} loaded={isLoaded}>
            <StackItem>
              <Flex direction={{ default: 'row' }}>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <SSHServiceSelect
                    onSSHChange={onSSHChange}
                    sshService={sshService}
                    sshServiceLoaded={sshServiceLoaded}
                  />
                </FlexItem>

                <SSHServiceStateIcon sshService={sshService} sshServiceLoaded={sshServiceLoaded} />
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
          </StateHandler>
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
