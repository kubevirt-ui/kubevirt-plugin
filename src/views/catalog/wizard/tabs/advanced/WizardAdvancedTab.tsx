import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardAdvancedTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardAdvancedTab</div>;
};

export default WizardAdvancedTab;
