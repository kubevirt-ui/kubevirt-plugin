import React, { FC, useEffect } from 'react';
import produce from 'immer';

import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import CustomizeVirtualMachine from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/CustomizeVirtualMachine';

const CustomizationStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster } = useVMWizardStore();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const vm = vmSignal.value;

  useEffect(() => {
    if (isIPv6SingleStack && vm && getNetworks(vm)?.some(isPodNetwork)) {
      vmSignal.value = produce(vm, (draft) => {
        removePodNetworkFromVM(draft);
      });
    }
  }, [isIPv6SingleStack, vm]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Customization')}
        </Title>
      </StackItem>
      <StackItem>
        {t(
          'You can customize {{ virtualMachineName }} before creating it by editing it via the tabs.',
          { virtualMachineName: getName(vm) || '' },
        )}
      </StackItem>
      <StackItem>
        <CustomizeVirtualMachine />
      </StackItem>
    </Stack>
  );
};

export default CustomizationStep;
