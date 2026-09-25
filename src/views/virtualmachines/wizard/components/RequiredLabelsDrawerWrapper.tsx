import type { FC, ReactNode } from 'react';

import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import useRequiredVMLabelsDrawer from '@virtualmachines/wizard/hooks/useRequiredVMLabelsDrawer';

import RequiredVMLabelsDrawer from '../steps/CustomizationStep/components/RequiredVMLabelsDrawer';
import { type VMWizardStep } from '../utils/constants';

const RequiredLabelsDrawerWrapper: FC<{
  autoAppliedLabels: readonly AutoAppliedLabel[];
  children?: ReactNode;
  currentStep: VMWizardStep;
}> = ({ autoAppliedLabels, children, currentStep }) => {
  const { isPanelOpen, requiredLabels, setIsPanelOpen } = useRequiredVMLabelsDrawer(
    currentStep,
    autoAppliedLabels,
  );

  return (
    <Drawer isExpanded={isPanelOpen} position="end">
      <DrawerContent
        panelContent={
          isPanelOpen && (
            <RequiredVMLabelsDrawer
              onClose={() => setIsPanelOpen(false)}
              requiredLabels={requiredLabels}
            />
          )
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default RequiredLabelsDrawerWrapper;
