import type { FC } from 'react';

import { VMWizardProvider } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import VMWizardStateProvider from './state/VMWizardStateProvider';
import VMCreationWizardContent from './VMCreationWizardContent';

const VMCreationWizard: FC = () => {
  return (
    <VMWizardStateProvider>
      <VMWizardProvider>
        <VMCreationWizardContent />
      </VMWizardProvider>
    </VMWizardStateProvider>
  );
};

export default VMCreationWizard;
