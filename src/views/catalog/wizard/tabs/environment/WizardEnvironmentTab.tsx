import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardEnvironmentTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardEnvironmentTab</div>;
};

export default WizardEnvironmentTab;
