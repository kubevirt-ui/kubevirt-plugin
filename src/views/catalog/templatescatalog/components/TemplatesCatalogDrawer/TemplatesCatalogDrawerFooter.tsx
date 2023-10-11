import React, { FC, useEffect } from 'react';

import { SecretModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import {
  generateVMName,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import {
  useProcessedTemplate,
  useVmTemplateSource,
} from '@kubevirt-utils/resources/template/hooks';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
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

export const TemplatesCatalogDrawerFooter: FC<TemplateCatalogDrawerFooterProps> = ({
  namespace,
  onCancel,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    isBootSourceAvailable,
    loaded: bootSourceLoaded,
    templateBootSource,
  } = useVmTemplateSource(template);

  const [authorizedSSHKeys, updateAuthorizedSSHKeys, userSettingsLoaded] =
    useKubevirtUserSettings('ssh');
  const { loaded: loadedRHELSubscription, subscriptionData } = useRHELAutomaticSubscription();
  const [processedTemplate, processedTemplateLoaded] = useProcessedTemplate(template, namespace);
  const [, , loadError] = useK8sWatchResource<IoK8sApiCoreV1Secret>(
    authorizedSSHKeys?.[namespace] && {
      groupVersionKind: getGroupVersionKindForModel(SecretModel),
      isList: false,
      name: authorizedSSHKeys?.[namespace],
      namespace,
    },
  );

  useEffect(() => {
    // if an error exists it means the secret can not be reached and should be removed from user settings
    if (loadError && authorizedSSHKeys?.[namespace]) {
      updateAuthorizedSSHKeys({ ...authorizedSSHKeys, [namespace]: '' });
    }
  }, [authorizedSSHKeys, loadError, namespace, updateAuthorizedSSHKeys]);

  const canQuickCreate = Boolean(processedTemplate) && isBootSourceAvailable;
  const loaded =
    bootSourceLoaded && processedTemplateLoaded && userSettingsLoaded && loadedRHELSubscription;

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
            authorizedSSHKey={!loadError && authorizedSSHKeys?.[namespace]}
            canQuickCreate={canQuickCreate}
            initialVMName={initialVMName}
            isBootSourceAvailable={isBootSourceAvailable}
            namespace={namespace}
            onCancel={onCancel}
            subscriptionData={subscriptionData}
            template={template}
            templateBootSource={templateBootSource}
          />
        </Stack>
      </div>
    </Stack>
  );
};
