import * as React from 'react';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

const WizardOverviewTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded, error }) => {
  console.log(vm, updateVM, loaded, error);

  return <div>WizardOverviewTab</div>;
};

export default WizardOverviewTab;
