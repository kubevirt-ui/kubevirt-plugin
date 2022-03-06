import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardSchedulingTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardSchedulingTab</div>;
};

export default WizardSchedulingTab;
