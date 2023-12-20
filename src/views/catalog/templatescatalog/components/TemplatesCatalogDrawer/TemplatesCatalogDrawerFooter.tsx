import React, { FC, useEffect } from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
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

import { useDrawerContext } from './hooks/useDrawerContext';
import { TemplatesCatalogDrawerCreateForm } from './TemplatesCatalogDrawerCreateForm';
import { TemplatesCatalogDrawerFooterSkeleton } from './TemplatesCatalogDrawerFooterSkeleton';

type TemplateCatalogDrawerFooterProps = {
  namespace: string;
  onCancel: () => void;
};

export const TemplatesCatalogDrawerFooter: FC<TemplateCatalogDrawerFooterProps> = ({
  namespace,
  onCancel,
}) => {
  const { t } = useKubevirtTranslation();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, userSettingsLoaded] =
    useKubevirtUserSettings('ssh');
  const { loaded: loadedRHELSubscription, subscriptionData } = useRHELAutomaticSubscription();
  const { isBootSourceAvailable, templateDataLoaded, templateLoadingError } = useDrawerContext();

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

  const loaded = templateDataLoaded && userSettingsLoaded && loadedRHELSubscription;

  if (!loaded && !templateLoadingError) {
    return <TemplatesCatalogDrawerFooterSkeleton />;
  }

  return (
    <Stack className="template-catalog-drawer-info">
      <div className="template-catalog-drawer-footer-section">
        <Stack hasGutter>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <Title headingLevel="h1" size="lg">
                  {isBootSourceAvailable
                    ? t('Quick create VirtualMachine')
                    : t('Customize VirtualMachine')}
                </Title>
              </SplitItem>
              {isBootSourceAvailable && (
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
            canQuickCreate={isBootSourceAvailable}
            namespace={namespace}
            onCancel={onCancel}
            subscriptionData={subscriptionData}
          />
        </Stack>
      </div>
    </Stack>
  );
};
