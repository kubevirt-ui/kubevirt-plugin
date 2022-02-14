import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { HorizontalNav, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

import { vmPageNav } from './tabs';

export type VirtualMachineDetailsPageProps = {
  name: string;
};

const VirtualMachinePage: React.FC<VirtualMachineDetailsPageProps> = ({ name: vmName }) => {
  const { t } = useTranslation('plugin__kubevirt-plugin');

  return (
    <>
      <ListPageHeader title={t(vmName)} />
      <HorizontalNav pages={vmPageNav} />
    </>
  );
};

export default VirtualMachinePage;
