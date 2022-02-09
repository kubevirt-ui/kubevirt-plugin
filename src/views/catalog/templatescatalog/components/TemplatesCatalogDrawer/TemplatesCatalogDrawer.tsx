import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal, Split, SplitItem } from '@patternfly/react-core';

import {
  getTemplateName,
  getTemplateProviderName,
  getTemplateSupportLevel,
} from '../../utils/helpers';
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
  const { t } = useKubevirtTranslation();
  const provider = getTemplateProviderName(template);
  const support = getTemplateSupportLevel(template);
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
          vendor={
            <Split hasGutter>
              <SplitItem>
                <strong>{t('Provided by: ')}</strong> {provider}
              </SplitItem>{' '}
              <SplitItem> | </SplitItem>
              <SplitItem>
                <strong>{t('Support level: ')}</strong> {support || 'N/A'}
              </SplitItem>
              <SplitItem> | </SplitItem>
              <SplitItem>
                <strong>{t('Supports quick create VM')}</strong>
              </SplitItem>
            </Split>
          }
          iconImg={osIcon}
        />
      }
      footer={
        <TemplatesCatalogDrawerFooter
          namespace={namespace}
          template={template}
          onCreate={(tmp) => console.log(tmp)}
          onCancel={onClose}
        />
      }
    >
      <TemplatesCatalogDrawerPanel template={template} />
    </Modal>
  );
};
