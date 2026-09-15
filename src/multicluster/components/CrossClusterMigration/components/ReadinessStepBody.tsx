import { type FC } from 'react';
import { type Updater } from 'use-immer';

import {
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTargetProviderName } from '@kubevirt-utils/resources/plan/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { Title } from '@patternfly/react-core';

import { getClusterFromProvider } from '../utils';

import useComputeReadiness from '../hooks/useComputeReadiness';
import useNetworkReadiness from '../hooks/useNetworkReadiness';
import useStorageReadiness from '../hooks/useStorageReadiness';
import useVersionReadiness from '../hooks/useVersionReadiness';
import MainReadinessCheck from './MainReadinessCheck';
import ReadinessWizardSteps from './ReadinessWizardSteps';

type ReadinessStepBodyProps = {
  migrationPlan: V1beta1Plan;
  networkMap: V1beta1NetworkMap;
  setMigrationPlan: Updater<V1beta1Plan>;
  setNetworkMap: Updater<V1beta1NetworkMap>;
  setStorageMap: Updater<V1beta1StorageMap>;
  storageMap: V1beta1StorageMap;
  vms: V1VirtualMachine[];
};

const ReadinessStepBody: FC<ReadinessStepBodyProps> = ({
  migrationPlan,
  networkMap,
  setNetworkMap,
  setStorageMap,
  storageMap,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const targetProvider = getTargetProviderName(migrationPlan);
  const targetCluster = getClusterFromProvider(targetProvider);

  const {
    changeStorageMap,
    isReady: storageIsReady,
    loaded: storageLoaded,
    targetStorageClasses,
  } = useStorageReadiness(vms, targetCluster, storageMap, setStorageMap);

  const {
    changeNetworkMap,
    isReady: networkIsReady,
    loaded: networkLoaded,
    targetNADs,
  } = useNetworkReadiness(vms, targetCluster, networkMap, setNetworkMap);

  const {
    isReady: computeIsReady,
    loaded: computeLoaded,
    nodesArchs,
    vmsArchs,
  } = useComputeReadiness(vms, targetCluster);

  const {
    isReady: versionIsReady,
    loaded: versionLoaded,
    sourceClusterVersion,
    sourceKubevirtVersion,
    targetClusterVersion,
    targetKubevirtVersion,
  } = useVersionReadiness(getCluster(vms?.[0]), targetCluster);

  return (
    <>
      <Title className="cross-cluster-migration-title" headingLevel="h4">
        {t('Migration readiness')}
      </Title>

      <MainReadinessCheck
        checks={[networkIsReady, storageIsReady, computeIsReady, versionIsReady]}
        loadedChecks={[networkLoaded, storageLoaded, computeLoaded, versionLoaded]}
      />

      <ReadinessWizardSteps
        changeNetworkMap={changeNetworkMap}
        changeStorageMap={changeStorageMap}
        computeIsReady={computeIsReady}
        computeLoaded={computeLoaded}
        networkIsReady={networkIsReady}
        networkLoaded={networkLoaded}
        networkMap={networkMap}
        nodesArchs={nodesArchs}
        sourceClusterVersion={sourceClusterVersion}
        sourceKubevirtVersion={sourceKubevirtVersion}
        storageIsReady={storageIsReady}
        storageLoaded={storageLoaded}
        storageMap={storageMap}
        targetClusterVersion={targetClusterVersion}
        targetKubevirtVersion={targetKubevirtVersion}
        targetNADs={targetNADs}
        targetStorageClasses={targetStorageClasses}
        versionIsReady={versionIsReady}
        versionLoaded={versionLoaded}
        vmsArchs={vmsArchs}
      />
    </>
  );
};

export default ReadinessStepBody;
