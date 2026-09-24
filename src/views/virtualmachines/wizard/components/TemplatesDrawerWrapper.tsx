import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import { TemplatesCatalogDrawer } from '../steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

const TemplatesDrawerWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const { control } = useVMWizard();
  const { isTemplateDrawerOpen, setIsTemplateDrawerOpen } = useVMWizardState();
  const selectedTemplate = useWatch({
    control,
    name: 'template.selectedTemplate',
  });

  const handleDrawerClose = (): void => {
    setIsTemplateDrawerOpen(false);
  };

  return (
    <Drawer isExpanded={isTemplateDrawerOpen && !!selectedTemplate} position="end">
      <DrawerContent
        panelContent={
          <TemplatesCatalogDrawer onClose={handleDrawerClose} template={selectedTemplate} />
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default TemplatesDrawerWrapper;
