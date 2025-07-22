import React, { FC } from 'react';
import { Updater } from 'use-immer';

import { V1beta1NetworkMap, V1beta1Plan, V1beta1StorageMap } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTargetProviderName } from '@kubevirt-utils/resources/plan/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { Title, Wizard, WizardStep } from '@patternfly/react-core';

import useComputeReadiness from '../hooks/useComputeReadiness';
import useNetworkReadiness from '../hooks/useNetworkReadiness';
import useStorageReadiness from '../hooks/useStorageReadiness';
import useVersionReadiness from '../hooks/useVersionReadiness';
import { getClusterFromProvider } from '../utils';

import ComputeCompatibility from './ComputeCompatibility';
import MainReadinessCheck from './MainReadinessCheck';
import NetworkMapping from './NetworkMapping';
import ReadinessWizardNavItem from './ReadinessWizardNavItem';
import StorageMapping from './StorageMapping';
import VersionCompatibility from './VersionCompatibility';

type ReadinessStepProps = {
  migrationPlan: V1beta1Plan;
  networkMap: V1beta1NetworkMap;
  setMigrationPlan: Updater<V1beta1Plan>;
  setNetworkMap: Updater<V1beta1NetworkMap>;
  setStorageMap: Updater<V1beta1StorageMap>;
  storageMap: V1beta1StorageMap;
  vms: V1VirtualMachine[];
};

const ReadinessStep: FC<ReadinessStepProps> = ({
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
  } = useStorageReadiness(vms, targetProvider, storageMap, setStorageMap);

  const {
    changeNetworkMap,
    isReady: networkIsReady,
    loaded: networkLoaded,
    targetNADs,
  } = useNetworkReadiness(vms, targetProvider, networkMap, setNetworkMap);

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

      <Wizard footer={<></>}>
        <WizardStep
          navItem={{
            content: (
              <ReadinessWizardNavItem
                checked={networkIsReady}
                loaded={networkLoaded}
                title={t('Network mapping')}
              />
            ),
          }}
          id="network-mapping"
          name={t('Network mapping')}
        >
          <NetworkMapping
            changeNetworkMap={changeNetworkMap}
            nads={targetNADs}
            networkMap={networkMap}
          />
        </WizardStep>
        <WizardStep
          navItem={{
            content: (
              <ReadinessWizardNavItem
                checked={storageIsReady}
                loaded={storageLoaded}
                title={t('Storage mapping')}
              />
            ),
          }}
          id="storage-mapping"
          name={t('Storage mapping')}
        >
          <StorageMapping
            changeStorageMap={changeStorageMap}
            storageClasses={targetStorageClasses}
            storageMap={storageMap}
          />
        </WizardStep>
        <WizardStep
          navItem={{
            content: (
              <ReadinessWizardNavItem
                checked={computeIsReady}
                loaded={computeLoaded}
                title={t('Compute compatibility')}
              />
            ),
          }}
          id="compute-compatibility"
          name={t('Compute compatibility')}
        >
          <ComputeCompatibility nodesArchs={nodesArchs} vmArchs={vmsArchs} />
        </WizardStep>
        <WizardStep
          navItem={{
            content: (
              <ReadinessWizardNavItem
                checked={versionIsReady}
                loaded={versionLoaded}
                title={t('Version compatibility')}
              />
            ),
          }}
          id="version-compatibility"
          name={t('Version compatibility')}
        >
          <VersionCompatibility
            sourceClusterVersion={sourceClusterVersion}
            sourceKubevirtVersion={sourceKubevirtVersion}
            targetClusterVersion={targetClusterVersion}
            targetKubevirtVersion={targetKubevirtVersion}
          />
        </WizardStep>
      </Wizard>
    </>
  );
};

export default ReadinessStep;
