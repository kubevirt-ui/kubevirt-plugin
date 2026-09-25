import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import { TemplatesCatalogDrawer } from '../steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

const TemplatesDrawerWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const { control } = useVMWizardForm();
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
