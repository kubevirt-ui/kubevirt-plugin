import React, { FC } from 'react';

import { VMWizardProvider } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';

import VMCreationWizardContent from './VMCreationWizardContent';

// TODO: remove New from the name
const VMCreationWizardNew: FC = () => {
  return (
    <VMWizardProvider>
      <VMCreationWizardContent />
    </VMWizardProvider>
  );
};

export default VMCreationWizardNew;
