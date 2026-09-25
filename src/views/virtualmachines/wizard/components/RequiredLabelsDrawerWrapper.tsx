import type { FC, PropsWithChildren } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useRequiredVMLabelsDrawer from '@virtualmachines/wizard/hooks/useRequiredVMLabelsDrawer';

import RequiredVMLabelsDrawer from '../steps/CustomizationStep/components/RequiredVMLabelsDrawer';
import { type VMWizardStep } from '../utils/constants';

type RequiredLabelsDrawerWrapperProps = PropsWithChildren<{
  currentStep: VMWizardStep;
}>;

const RequiredLabelsDrawerWrapper: FC<RequiredLabelsDrawerWrapperProps> = ({
  children,
  currentStep,
}) => {
  const { autoAppliedLabels } = useVMWizardForm();
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
