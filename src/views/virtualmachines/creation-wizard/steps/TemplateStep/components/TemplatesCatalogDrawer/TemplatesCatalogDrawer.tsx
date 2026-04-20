import React, { FCC } from 'react';

import { Template } from '@kubevirt-utils/resources/template';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import TemplatesCatalogDrawerPanel from './components/TemplatesCatalogDrawerPanel/TemplatesCatalogDrawerPanel';
import { DrawerContextProvider } from './hooks/useDrawerContext';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  onClose: () => void;
  template: Template | undefined;
};

export const TemplatesCatalogDrawer: FCC<TemplatesCatalogDrawerProps> = ({ onClose, template }) => {
  if (!template) return null;

  const templateName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template);

  return (
    <DrawerContextProvider template={template}>
      <DrawerPanelContent className="template-catalog-drawer" maxSize="37.5rem" minSize="37.5rem">
        <DrawerHead>
          <CatalogItemHeader
            className="co-catalog-page__overlay-header"
            iconImg={osIcon}
            title={templateName}
            vendor={template?.metadata?.name}
          />
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <TemplatesCatalogDrawerPanel />
        </DrawerPanelBody>
      </DrawerPanelContent>
    </DrawerContextProvider>
  );
};
