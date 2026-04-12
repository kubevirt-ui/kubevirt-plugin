import React, { FC } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import { TemplatesCatalogDrawer } from '../steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

const TemplatesDrawerWrapper: FC = ({ children }) => {
  const { selectedTemplate, setTemplatesDrawerIsOpen, templatesDrawerIsOpen } = useVMWizardStore();

  const handleDrawerClose = () => {
    setTemplatesDrawerIsOpen(false);
  };

  return (
    <Drawer isExpanded={templatesDrawerIsOpen && !!selectedTemplate} position="end">
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
