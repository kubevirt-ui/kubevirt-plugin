import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardScriptsTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardScriptsTab</div>;
};

export default WizardScriptsTab;
