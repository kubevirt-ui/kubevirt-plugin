import React, { type FC, useMemo } from 'react';
import { useParams } from 'react-router';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModelGroupVersionKind } from '@kubevirt-utils/models';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import VMNetworkTitle from './components/VMNetworkTitle';
import ConnectedProjects from './tabs/ConnectedProjects/ConnectedProjects';
import ConnectedVirtualMachines from './tabs/ConnectedVirtualMachines/ConnectedVirtualMachines';
import NetworkDetailPage from './tabs/NetworkDetailPage';
import NetworkYAMLPage from './tabs/NetworkYAMLPage';

const VMNetworkDetailsPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const { name } = useParams<{ name: string }>();
  const [vmNetwork, loaded, error] = useK8sWatchResource<ClusterUserDefinedNetworkKind>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: false,
    name: name,
    namespaced: false,
  }) as [ClusterUserDefinedNetworkKind, boolean, Error];

  const { hideYamlTab } = useHideYamlTab();
  const pages = useMemo(
    () =>
      removeYamlTabs(
        [
          {
            component: NetworkDetailPage,
            href: '',
            name: t('Details'),
          },
          {
            component: NetworkYAMLPage,
            href: 'yaml',
            name: t('YAML'),
          },
          {
            component: ConnectedProjects,
            href: 'connected-projects',
            name: t('Connected projects'),
          },
          {
            component: ConnectedVirtualMachines,
            href: 'connected-virtual-machines',
            name: t('Connected virtual machines'),
          },
        ],
        hideYamlTab,
      ),
    [t, hideYamlTab],
  );

  if (!loaded) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <StateHandler error={error} hasData={!!vmNetwork} loaded={loaded} withBullseye>
      <VMNetworkTitle network={vmNetwork} />
      <HorizontalNav pages={pages} resource={vmNetwork} />
    </StateHandler>
  );
};

export default VMNetworkDetailsPage;
