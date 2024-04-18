import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { Stack, StackItem } from '@patternfly/react-core';

import CustomizeITVMFooter from './components/CustomizeITVMFooter';
import CustomizeITVMHeader from './components/CustomizeITVMHeader';
import { pages } from './utils/constants';

const CustomizeInstanceTypeVirtualMachine: FC = () => {
  const { vm } = useInstanceTypeVMStore();

  return (
    <Stack hasGutter>
      <CustomizeITVMHeader />
      <StackItem isFilled>
        <HorizontalNavbar pages={pages} vm={vm} />
      </StackItem>
      <CustomizeITVMFooter />
    </Stack>
  );
};

export default CustomizeInstanceTypeVirtualMachine;
