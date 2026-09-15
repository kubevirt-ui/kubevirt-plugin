import type { FC } from 'react';
import React from 'react';

import TemplateVMGenerationProvider from '@virtualmachines/wizard/state/template-vm-generation-context/TemplateVMGenerationProvider';
import { VMWizardProvider } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import VMCreationWizardContent from './VMCreationWizardContent';

const VMCreationWizard: FC = () => {
  return (
    <VMWizardProvider>
      <TemplateVMGenerationProvider>
        <VMCreationWizardContent />
      </TemplateVMGenerationProvider>
    </VMWizardProvider>
  );
};

export default VMCreationWizard;
