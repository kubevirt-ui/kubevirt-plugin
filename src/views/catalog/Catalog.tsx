import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: React.FC = () => {
  return (
    <WizardVMContextProvider>
      <Switch>
        <Route
          path={[
            '/k8s/ns/:ns/catalog/template/review',
            '/k8s/all-namespaces/catalog/template/review',
          ]}
          component={Wizard}
        />
        <Route
          path={[
            '/k8s/all-namespaces/catalog',
            '/k8s/ns/:ns/catalog',
            '/k8s/ns/:ns/catalog/template',
            '/k8s/all-namespaces/catalog/template',
            '/k8s/ns/:ns/catalog/instanceTypes',
            '/k8s/all-namespaces/catalog/instanceTypes',
          ]}
          component={CreateVMHorizontalNav}
        />
      </Switch>
    </WizardVMContextProvider>
  );
};
export default Catalog;
