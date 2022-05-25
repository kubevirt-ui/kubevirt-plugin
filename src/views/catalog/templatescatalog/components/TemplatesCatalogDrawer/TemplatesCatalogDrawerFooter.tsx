import * as React from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  useProcessedTemplate,
  useVmTemplateSource,
} from '@kubevirt-utils/resources/template/hooks';
import { produceTemplateBootSourceStorageClass } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import { TemplatesCatalogDrawerCreateForm } from './TemplatesCatalogDrawerCreateForm';
import { TemplatesCatalogDrawerFooterSkeleton } from './TemplatesCatalogDrawerFooterSkeleton';

type TemplateCatalogDrawerFooterProps = {
  namespace: string;
  template: V1Template | undefined;
  onCancel: () => void;
};

export const TemplatesCatalogDrawerFooter: React.FC<TemplateCatalogDrawerFooterProps> = ({
  namespace,
  template,
  onCancel,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    templateBootSource,
    isBootSourceAvailable,
    loaded: bootSourceLoaded,
  } = useVmTemplateSource(template);
  const [processedTemplate, processedTemplateLoaded] = useProcessedTemplate(template, namespace);

  const canQuickCreate = !!processedTemplate && isBootSourceAvailable;
  const loaded = bootSourceLoaded && processedTemplateLoaded;

  // update template's boot source storageClass if it's available
  const updatedTemplate = produce(template, (templateDraft) => {
    if (templateBootSource?.storageClassName) {
      const producedTemplate = produceTemplateBootSourceStorageClass(
        template,
        templateBootSource.storageClassName,
      );
      templateDraft.objects = producedTemplate.objects;
    }
  });

  return loaded ? (
    <Stack className="template-catalog-drawer-info">
      <div className="template-catalog-drawer-footer-section">
        <Stack hasGutter>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <Title headingLevel="h1" size="lg">
                  {canQuickCreate
                    ? t('Quick create VirtualMachine')
                    : t('Customize VirtualMachine')}
                </Title>
              </SplitItem>
              {canQuickCreate && (
                <SplitItem className="template-catalog-drawer-footer-tooltip">
                  <Tooltip
                    position={TooltipPosition.right}
                    content={<div>{t('This Template supports quick create VirtualMachine')}</div>}
                  >
                    <OutlinedQuestionCircleIcon />
                  </Tooltip>
                </SplitItem>
              )}
            </Split>
          </StackItem>
          <TemplatesCatalogDrawerCreateForm
            namespace={namespace}
            template={updatedTemplate}
            canQuickCreate={canQuickCreate}
            isBootSourceAvailable={isBootSourceAvailable}
            onCancel={onCancel}
          />
        </Stack>
      </div>
    </Stack>
  ) : (
    <TemplatesCatalogDrawerFooterSkeleton />
  );
};
