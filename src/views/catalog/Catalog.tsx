import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import CustomizeInstanceTypeVirtualMachine from './CustomizeInstanceType/CustomizeInstanceTypeVirtualMachine';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: FC = () => {
  return (
    <WizardVMContextProvider>
      <DocumentTitle>{PageTitles.Catalog}</DocumentTitle>
      <ClusterProjectDropdown />
      <Routes>
        <Route Component={Wizard} path={'template/review/*'} />
        <Route Component={CustomizeInstanceTypeVirtualMachine} path={`review/*`} />
        <Route Component={CreateVMHorizontalNav} path={'/*'} />
      </Routes>
    </WizardVMContextProvider>
  );
};
export default Catalog;
