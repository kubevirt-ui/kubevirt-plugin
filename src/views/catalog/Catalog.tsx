import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import CreateVMHorizontalNav from './CreateVMHorizontalNav/CreateVMHorizontalNav';
import CustomizeVirtualMachine from './customize/CustomizeVirtualMachine';
import { WizardVMContextProvider } from './utils/WizardVMContext';
import Wizard from './wizard/Wizard';

const Catalog: React.FC<RouteComponentProps<{ ns?: string }>> = () => {
  return (
    <WizardVMContextProvider>
      <Switch>
        <Route
          path={[
            '/k8s/ns/:ns/templatescatalog/customize',
            '/k8s/all-namespaces/templatescatalog/customize',
          ]}
          component={CustomizeVirtualMachine}
        />
        <Route
          path={[
            '/k8s/ns/:ns/templatescatalog/review',
            '/k8s/all-namespaces/templatescatalog/review',
          ]}
          component={Wizard}
        />
        <Route
          path={[
            '/k8s/ns/:ns/templatescatalog',
            '/k8s/all-namespaces/templatescatalog',
            '/k8s/ns/:ns/templatescatalog/instanceTypes',
            '/k8s/all-namespaces/templatescatalog/instanceTypes',
          ]}
          component={CreateVMHorizontalNav}
        />
      </Switch>
    </WizardVMContextProvider>
  );
};
export default Catalog;
