import produce from 'immer';
import React, { FC, useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNetworks } from '@kubevirt-utils/resources/vm';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import CustomizeVirtualMachine from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/CustomizeVirtualMachine';

const CustomizationStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const vm = customizeWizardVMSignal.value;

  useEffect(() => {
    if (isIPv6SingleStack && vm && getNetworks(vm)?.some(isPodNetwork)) {
      customizeWizardVMSignal.value = produce(vm, (draft) => {
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
        {t('Optionally, explore the tabs to further edit your VirtualMachine.')}
      </StackItem>
      <StackItem>
        <CustomizeVirtualMachine />
      </StackItem>
    </Stack>
  );
};

export default CustomizationStep;
