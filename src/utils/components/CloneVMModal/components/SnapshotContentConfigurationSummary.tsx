import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotContentModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineSnapshot,
  V1beta1VirtualMachineSnapshotContent,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Alert, AlertVariant } from '@patternfly/react-core';

import ConfigurationSummary from './ConfigurationSummary';

type SnapshotContentConfigurationSummaryProps = {
  snapshot: V1beta1VirtualMachineSnapshot;
};

const SnapshotContentConfigurationSummary: FC<SnapshotContentConfigurationSummaryProps> = ({
  snapshot,
}) => {
  const { t } = useKubevirtTranslation();

  const [snapshotContent, loaded, error] = useK8sWatchData<V1beta1VirtualMachineSnapshotContent>(
    snapshot && {
      cluster: getCluster(snapshot),
      groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotContentModel),
      name: snapshot.status.virtualMachineSnapshotContentName,
      namespace: getNamespace(snapshot) || DEFAULT_NAMESPACE,
    },
  );

  if (!loaded) return <Loading />;

  if (error) {
    return (
      <Alert
        isInline
        title={t('Error loading the VirtualMachineSnapshotContent')}
        variant={AlertVariant.danger}
      >
        {error?.message}
      </Alert>
    );
  }

  return (
    <ConfigurationSummary vm={snapshotContent?.spec?.source?.virtualMachine as V1VirtualMachine} />
  );
};

export default SnapshotContentConfigurationSummary;
