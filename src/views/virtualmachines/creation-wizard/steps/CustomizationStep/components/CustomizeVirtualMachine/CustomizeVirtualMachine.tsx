import React, { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import CustomizeVMTabs from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/CustomizeVMTabs';

const CustomizeVirtualMachine: FC = () => {
  useSignals();

  return (
    <Stack>
      <StackItem isFilled>
        <CustomizeVMTabs />
      </StackItem>
    </Stack>
  );
};

export default CustomizeVirtualMachine;
