import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: FC = () => {
  return (
    <WizardVMContextProvider>
      <Routes>
        <Route Component={Wizard} path={'template/review/*'} />
        <Route Component={CreateVMHorizontalNav} path={'/*'} />
      </Routes>
    </WizardVMContextProvider>
  );
};
export default Catalog;
