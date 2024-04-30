import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import { useSignals } from '@preact/signals-react/runtime';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import CustomizeInstanceTypeVirtualMachine from './CustomizeInstanceType/CustomizeInstanceTypeVirtualMachine';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: FC = () => {
  useSignals();
  return (
    <WizardVMContextProvider>
      <Routes>
        <Route Component={Wizard} path={'template/review/*'} />
        <Route Component={CustomizeInstanceTypeVirtualMachine} path={`review/*`} />
        <Route Component={CreateVMHorizontalNav} path={'/*'} />
      </Routes>
    </WizardVMContextProvider>
  );
};
export default Catalog;
