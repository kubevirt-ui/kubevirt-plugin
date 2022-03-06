import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardYAMLTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardYAMLTab</div>;
};

export default WizardYAMLTab;
