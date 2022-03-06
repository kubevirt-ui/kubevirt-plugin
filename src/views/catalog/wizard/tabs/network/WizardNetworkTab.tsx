import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardNetworkTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardNetworkTab</div>;
};

export default WizardNetworkTab;
