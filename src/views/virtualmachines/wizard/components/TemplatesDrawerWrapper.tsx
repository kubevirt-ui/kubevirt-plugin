import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import { TemplatesCatalogDrawer } from '../steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

const TemplatesDrawerWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const { control, setValue } = useVMWizard();
  const [selectedTemplate, isTemplatesDrawerOpen] = useWatch({
    control,
    name: ['template.selectedTemplate', 'template.isDrawerOpen'],
  });

  const handleDrawerClose = (): void => {
    setValue('template.isDrawerOpen', false);
  };

  return (
    <Drawer isExpanded={isTemplatesDrawerOpen && !!selectedTemplate} position="end">
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
