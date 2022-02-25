import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import CustomizeVirtualMachine from './customize/CustomizeVirtualMachine';
import TemplatesCatalog from './templatescatalog/TemplatesCatalog';
import Wizard from './wizard/Wizard';

const Catalog: React.FC = () => {
  return (
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
      <Route component={TemplatesCatalog} />
    </Switch>
  );
};
export default Catalog;
