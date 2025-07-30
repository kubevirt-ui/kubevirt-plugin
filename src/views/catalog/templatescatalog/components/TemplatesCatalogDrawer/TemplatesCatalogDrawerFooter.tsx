import React, { FC, useEffect } from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem, Title } from '@patternfly/react-core';

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
  const cluster = useClusterParam();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, userSettingsLoaded] = useKubevirtUserSettings(
    'ssh',
    cluster,
  );
  const { loaded: loadedRHELSubscription, subscriptionData } = useRHELAutomaticSubscription();
  const { templateDataLoaded, templateLoadingError } = useDrawerContext();

  const [, , loadError] = useK8sWatchData<IoK8sApiCoreV1Secret>(
    authorizedSSHKeys?.[namespace] && {
      cluster,
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
            <Title headingLevel="h1" size="lg">
              {t('Quick create VirtualMachine')}
            </Title>
          </StackItem>
          <TemplatesCatalogDrawerCreateForm
            authorizedSSHKey={!loadError && authorizedSSHKeys?.[namespace]}
            namespace={namespace}
            onCancel={onCancel}
            subscriptionData={subscriptionData}
          />
        </Stack>
      </div>
    </Stack>
  );
};
