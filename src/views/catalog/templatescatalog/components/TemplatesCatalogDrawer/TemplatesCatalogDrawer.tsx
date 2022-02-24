import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal } from '@patternfly/react-core';

import { getTemplateName } from '../../../utils/templateGetters';
import { getTemplateOSIcon } from '../../utils/os-icons';

import { TemplatesCatalogDrawerFooter } from './TemplatesCatalogDrawerFooter';
import { TemplatesCatalogDrawerPanel } from './TemplatesCatalogDrawerPanel';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  namespace: string;
  template: V1Template | undefined;
  isOpen: boolean;
  onClose: () => void;
};

export const TemplatesCatalogDrawer: React.FC<TemplatesCatalogDrawerProps> = ({
  namespace,
  template,
  isOpen,
  onClose,
}) => {
  const templateName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template);

  return (
    <Modal
      aria-label="template drawer"
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right template-catalog-drawer"
      isOpen={isOpen}
      onClose={onClose}
      header={
        <CatalogItemHeader
          className="co-catalog-page__overlay-header"
          title={templateName}
          vendor={template?.metadata?.name}
          iconImg={osIcon}
        />
      }
      footer={
        template && (
          <TemplatesCatalogDrawerFooter
            namespace={namespace}
            template={template}
            onCancel={onClose}
          />
        )
      }
    >
      <TemplatesCatalogDrawerPanel template={template} />
    </Modal>
  );
};
