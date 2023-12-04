import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineSnapshotContentModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotContentModel';
import {
  V1alpha1VirtualMachineSnapshot,
  V1alpha1VirtualMachineSnapshotContent,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

import ConfigurationSummary from './ConfigurationSummary';

type SnapshotContentConfigurationSummaryProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
};

const SnapshotContentConfigurationSummary: FC<SnapshotContentConfigurationSummaryProps> = ({
  snapshot,
}) => {
  const { t } = useKubevirtTranslation();

  const [snapshotContent, loaded, error] =
    useK8sWatchResource<V1alpha1VirtualMachineSnapshotContent>(
      snapshot && {
        groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotContentModel),
        name: snapshot.status.virtualMachineSnapshotContentName,
        namespace: snapshot.metadata.namespace || DEFAULT_NAMESPACE,
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
