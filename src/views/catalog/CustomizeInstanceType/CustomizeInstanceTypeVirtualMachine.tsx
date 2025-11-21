import React, { FC, useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import CustomizeITVMFooter from './components/CustomizeITVMFooter';
import CustomizeITVMHeader from './components/CustomizeITVMHeader';
import { getPages } from './utils/constants';

const CustomizeInstanceTypeVirtualMachine: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const { vm } = useInstanceTypeVMStore();
  const pages = useMemo(() => getPages(t), [t]);

  return (
    <Stack>
      <CustomizeITVMHeader />
      <StackItem isFilled>
        <HorizontalNavbar loaded pages={pages} vm={vm} />
      </StackItem>
      <CustomizeITVMFooter />
    </Stack>
  );
};

export default CustomizeInstanceTypeVirtualMachine;
