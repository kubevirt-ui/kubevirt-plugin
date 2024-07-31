import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { CANCEL_CREATE_VM_BUTTON_CLICKED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
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

  if (!isOpen) return null;

  const handleCancel = () => {
    logTemplateFlowEvent(CANCEL_CREATE_VM_BUTTON_CLICKED, template);
    onClose();
  };

  return (
    <DrawerContextProvider template={template}>
      <Modal
        footer={
          template && <TemplatesCatalogDrawerFooter namespace={namespace} onCancel={handleCancel} />
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
        className="pf-v5-c-modal-box ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right template-catalog-drawer"
        disableFocusTrap
        isOpen={isOpen}
        onClose={onClose}
      >
        <TemplatesCatalogDrawerPanel />
      </Modal>
    </DrawerContextProvider>
  );
};
