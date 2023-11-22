import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../../utils/os-icons';

import { DrawerContextProvider } from './hooks/useDrawerContext';
import { TemplatesCatalogDrawerFooter } from './TemplatesCatalogDrawerFooter';
import { TemplatesCatalogDrawerPanel } from './TemplatesCatalogDrawerPanel';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  template: undefined | V1Template;
};

export const TemplatesCatalogDrawer: FC<TemplatesCatalogDrawerProps> = ({
  isOpen,
  namespace,
  onClose,
  template,
}) => {
  const templateName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template);

  return (
    <DrawerContextProvider template={template}>
      <Modal
        footer={
          template && <TemplatesCatalogDrawerFooter namespace={namespace} onCancel={onClose} />
        }
        header={
          <CatalogItemHeader
            className="co-catalog-page__overlay-header"
            iconImg={osIcon}
            title={templateName}
            vendor={template?.metadata?.name}
          />
        }
        aria-label="Template drawer"
        className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right template-catalog-drawer"
        disableFocusTrap
        isOpen={isOpen}
        onClose={onClose}
      >
        <TemplatesCatalogDrawerPanel />
      </Modal>
    </DrawerContextProvider>
  );
};
