import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal, ModalBody, ModalHeader } from '@patternfly/react-core';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import TemplatesCatalogDrawerPanel from './components/TemplatesCatalogDrawerPanel/TemplatesCatalogDrawerPanel';
import { DrawerContextProvider } from './hooks/useDrawerContext';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  template: undefined | V1Template;
};

export const TemplatesCatalogDrawer: FC<TemplatesCatalogDrawerProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const templateName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template);

  if (!isOpen || !template) return null;

  return (
    <DrawerContextProvider template={template}>
      <Modal
        aria-label="Template drawer"
        className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right template-catalog-drawer"
        disableFocusTrap
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalHeader>
          <CatalogItemHeader
            className="co-catalog-page__overlay-header"
            iconImg={osIcon}
            title={templateName}
            vendor={template?.metadata?.name}
          />
        </ModalHeader>
        <ModalBody>
          <TemplatesCatalogDrawerPanel />
        </ModalBody>
      </Modal>
    </DrawerContextProvider>
  );
};
