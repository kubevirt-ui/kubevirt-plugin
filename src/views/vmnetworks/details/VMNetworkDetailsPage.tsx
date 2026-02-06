import React, { FC, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { ClusterUserDefinedNetworkModelGroupVersionKind } from '@kubevirt-utils/models';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import VMNetworkTitle from './components/VMNetworkTitle';

const VMNetworkDetailsPage: FC = () => {
  const { name } = useParams<{ name: string }>();
  const [vmNetwork, loaded, error] = useK8sWatchResource<ClusterUserDefinedNetworkKind>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: false,
    name: name,
    namespaced: false,
  });

  const pages = useMemo(
    () => [
      {
        component: lazy(() => import('./tabs/NetworkDetailPage')),
        href: '',
        name: 'Details',
      },
      {
        component: lazy(() => import('./tabs/NetworkYAMLPage')),
        href: 'yaml',
        name: 'YAML',
      },
      {
        component: lazy(() => import('./tabs/ConnectedProjects/ConnectedProjects')),
        href: 'connected-projects',
        name: 'Connected projects',
      },
      {
        component: lazy(() => import('./tabs/ConnectedVirtualMachines/ConnectedVirtualMachines')),
        href: 'connected-virtual-machines',
        name: 'Connected virtual machines',
      },
    ],
    [],
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
