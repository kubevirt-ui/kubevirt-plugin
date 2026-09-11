import { type FC } from 'react';

import { type Template } from '@kubevirt-utils/resources/template';
import { DrawerPanelBody, DrawerPanelContent } from '@patternfly/react-core';
import { WIZARD_DRAWER_SIZE } from '@settings/constants';

import TemplatesCatalogDrawerHeader from './components/TemplatesCatalogDrawerHeader';
import TemplatesCatalogDrawerPanel from './components/TemplatesCatalogDrawerPanel/TemplatesCatalogDrawerPanel';
import { DrawerContextProvider } from './hooks/useDrawerContext';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  onClose: () => void;
  template: null | Template;
};

export const TemplatesCatalogDrawer: FC<TemplatesCatalogDrawerProps> = ({ onClose, template }) => {
  if (!template) return null;

  return (
    <DrawerContextProvider template={template}>
      <DrawerPanelContent
        className="template-catalog-drawer"
        maxSize={WIZARD_DRAWER_SIZE}
        minSize={WIZARD_DRAWER_SIZE}
      >
        <TemplatesCatalogDrawerHeader onClose={onClose} />
        <DrawerPanelBody>
          <TemplatesCatalogDrawerPanel />
        </DrawerPanelBody>
      </DrawerPanelContent>
    </DrawerContextProvider>
  );
};
