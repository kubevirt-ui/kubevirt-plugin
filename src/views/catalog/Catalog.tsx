import React, { FC, JSX } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import CustomizeInstanceTypeVirtualMachine from './CustomizeInstanceType/CustomizeInstanceTypeVirtualMachine';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: FC = (): JSX.Element => {
  const isACMPage = useIsACMPage();

  return (
    <WizardVMContextProvider>
      <DocumentTitle>{PageTitles.Catalog}</DocumentTitle>
      {isACMPage && <ClusterProjectDropdown includeAllClusters={false} includeAllProjects={true} />}
      <Routes>
        <Route Component={Wizard} path={'template/review/*'} />
        <Route Component={CustomizeInstanceTypeVirtualMachine} path={`review/*`} />
        <Route Component={CreateVMHorizontalNav} path={'/*'} />
      </Routes>
    </WizardVMContextProvider>
  );
};
export default Catalog;
