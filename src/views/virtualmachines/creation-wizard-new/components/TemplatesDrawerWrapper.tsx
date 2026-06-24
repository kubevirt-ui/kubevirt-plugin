import React, { FC, ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';

import { TemplatesCatalogDrawer } from '../steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

const TemplatesDrawerWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const { control, setValue } = useVMWizard();
  const [selectedTemplate, isTemplatesDrawerOpen] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
      CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN,
    ],
  });

  const handleDrawerClose = () => {
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, false);
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
