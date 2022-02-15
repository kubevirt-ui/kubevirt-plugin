import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

import { vmPageNav } from './tabs';

export type VirtualMachineDetailsPageProps = {
  name: string;
};

const VirtualMachinePage: React.FC<VirtualMachineDetailsPageProps> = ({ name: vmName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t(vmName)} />
      <HorizontalNav pages={vmPageNav} />
    </>
  );
};

export default VirtualMachinePage;
