import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardDisksTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardDisksTab</div>;
};

export default WizardDisksTab;
