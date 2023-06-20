import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import {
  generateVMName,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import {
  useProcessedTemplate,
  useVmTemplateSource,
} from '@kubevirt-utils/resources/template/hooks';
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
  onCancel: () => void;
  template: undefined | V1Template;
};

export const TemplatesCatalogDrawerFooter: React.FC<TemplateCatalogDrawerFooterProps> = ({
  namespace,
  onCancel,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useVmTemplateSource(template);
  const [authorizedSSHKeys, , userSettingsLoaded] = useKubevirtUserSettings('ssh');
  const [processedTemplate, processedTemplateLoaded] = useProcessedTemplate(template, namespace);

  const canQuickCreate = Boolean(processedTemplate) && isBootSourceAvailable;
  const loaded = bootSourceLoaded && processedTemplateLoaded && userSettingsLoaded;

  if (!loaded) {
    return <TemplatesCatalogDrawerFooterSkeleton />;
  }

  const initialVMName =
    getTemplateVirtualMachineObject(processedTemplate)?.metadata?.name || generateVMName(template);

  return (
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
                    content={<div>{t('This Template supports quick create VirtualMachine')}</div>}
                    position={TooltipPosition.right}
                  >
                    <OutlinedQuestionCircleIcon />
                  </Tooltip>
                </SplitItem>
              )}
            </Split>
          </StackItem>
          <TemplatesCatalogDrawerCreateForm
            authorizedSSHKey={authorizedSSHKeys?.[namespace]}
            canQuickCreate={canQuickCreate}
            initialVMName={initialVMName}
            isBootSourceAvailable={isBootSourceAvailable}
            namespace={namespace}
            onCancel={onCancel}
            template={template}
          />
        </Stack>
      </div>
    </Stack>
  );
};
