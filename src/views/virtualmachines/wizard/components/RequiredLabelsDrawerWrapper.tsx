import React, { FC, ReactNode } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import useRequiredVMLabelsDrawer from '@virtualmachines/wizard/hooks/useRequiredVMLabelsDrawer';

import RequiredVMLabelsDrawer from '../steps/CustomizationStep/components/RequiredVMLabelsDrawer';

const RequiredLabelsDrawerWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const { isPanelOpen, requiredLabels, setIsPanelOpen, vmLabels } = useRequiredVMLabelsDrawer();

  return (
    <Drawer isExpanded={isPanelOpen} position="end">
      <DrawerContent
        panelContent={
          isPanelOpen && (
            <RequiredVMLabelsDrawer
              onClose={() => setIsPanelOpen(false)}
              requiredLabels={requiredLabels}
              vmLabels={vmLabels}
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
