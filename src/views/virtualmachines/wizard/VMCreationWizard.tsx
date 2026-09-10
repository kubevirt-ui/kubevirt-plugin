import type { FC } from 'react';
import React from 'react';

import { VMWizardProvider } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import VMCreationWizardContent from './VMCreationWizardContent';

const VMCreationWizard: FC = () => {
  return (
    <VMWizardProvider>
      <VMCreationWizardContent />
    </VMWizardProvider>
  );
};

export default VMCreationWizard;
