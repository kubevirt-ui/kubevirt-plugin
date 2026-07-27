import React, { FC } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
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
import { WIZARD_DRAWER_SIZE } from '@settings/constants';
import { getTemplateOSIcon } from '@virtualmachines/wizard/utils/os-icons/os-icons';

import TemplatesCatalogDrawerPanel from './components/TemplatesCatalogDrawerPanel/TemplatesCatalogDrawerPanel';
import { DrawerContextProvider } from './hooks/useDrawerContext';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  onClose: () => void;
  template: Template | undefined;
};

export const TemplatesCatalogDrawer: FC<TemplatesCatalogDrawerProps> = ({ onClose, template }) => {
  if (!template) return null;

  const name = getName(template);
  const displayName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template);

  return (
    <DrawerContextProvider template={template}>
      <DrawerPanelContent
        className="template-catalog-drawer"
        maxSize={WIZARD_DRAWER_SIZE}
        minSize={WIZARD_DRAWER_SIZE}
      >
        <DrawerHead>
          <CatalogItemHeader
            className="co-catalog-page__overlay-header"
            iconImg={osIcon}
            title={name}
            vendor={displayName}
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
