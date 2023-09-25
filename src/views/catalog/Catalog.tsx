import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: FC = () => (
  <WizardVMContextProvider>
    <Switch>
      <Route
        path={[
          '/k8s/ns/:ns/templatescatalog/review',
          '/k8s/all-namespaces/templatescatalog/review',
        ]}
        component={Wizard}
      />
      <Route component={CreateVMHorizontalNav} />
    </Switch>
  </WizardVMContextProvider>
);

export default Catalog;
