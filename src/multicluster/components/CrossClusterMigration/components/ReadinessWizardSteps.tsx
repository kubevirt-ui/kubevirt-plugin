import React, { type FC } from 'react';

import { type V1beta1NetworkMap, type V1beta1StorageMap } from '@forklift-ui/types';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { Wizard, WizardStep } from '@patternfly/react-core';

import { type UseNetworkReadinessReturnType } from '../hooks/useNetworkReadiness';
import { type UseStorageReadinessReturnType } from '../hooks/useStorageReadiness';
import ComputeCompatibility from './ComputeCompatibility';
import NetworkMapping from './NetworkMapping';
import ReadinessWizardNavItem from './ReadinessWizardNavItem';
import StorageMapping from './StorageMapping';
import VersionCompatibility from './VersionCompatibility';

type ReadinessWizardStepsProps = {
  changeNetworkMap: UseNetworkReadinessReturnType['changeNetworkMap'];
  changeStorageMap: UseStorageReadinessReturnType['changeStorageMap'];
  computeIsReady: boolean;
  computeLoaded: boolean;
  networkIsReady: boolean;
  networkLoaded: boolean;
  networkMap: V1beta1NetworkMap;
  nodesArchs: string[];
  sourceClusterVersion: string;
  sourceKubevirtVersion: string;
  storageIsReady: boolean;
  storageLoaded: boolean;
  storageMap: V1beta1StorageMap;
  targetClusterVersion: string;
  targetKubevirtVersion: string;
  targetNADs: NetworkAttachmentDefinitionKind[];
  targetStorageClasses: IoK8sApiStorageV1StorageClass[];
  versionIsReady: boolean;
  versionLoaded: boolean;
  vmsArchs: string[];
};

const ReadinessWizardSteps: FC<ReadinessWizardStepsProps> = ({
  changeNetworkMap,
  changeStorageMap,
  computeIsReady,
  computeLoaded,
  networkIsReady,
  networkLoaded,
  networkMap,
  nodesArchs,
  sourceClusterVersion,
  sourceKubevirtVersion,
  storageIsReady,
  storageLoaded,
  storageMap,
  targetClusterVersion,
  targetKubevirtVersion,
  targetNADs,
  targetStorageClasses,
  versionIsReady,
  versionLoaded,
  vmsArchs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Wizard footer={<></>}>
      <WizardStep
        id="network-mapping"
        name={t('Network mapping')}
        navItem={{
          content: (
            <ReadinessWizardNavItem
              checked={networkIsReady}
              loaded={networkLoaded}
              title={t('Network mapping')}
            />
          ),
        }}
      >
        <NetworkMapping
          changeNetworkMap={changeNetworkMap}
          nads={targetNADs}
          networkMap={networkMap}
        />
      </WizardStep>
      <WizardStep
        id="storage-mapping"
        name={t('Storage mapping')}
        navItem={{
          content: (
            <ReadinessWizardNavItem
              checked={storageIsReady}
              loaded={storageLoaded}
              title={t('Storage mapping')}
            />
          ),
        }}
      >
        <StorageMapping
          changeStorageMap={changeStorageMap}
          storageClasses={targetStorageClasses}
          storageMap={storageMap}
        />
      </WizardStep>
      <WizardStep
        id="compute-compatibility"
        name={t('Compute compatibility')}
        navItem={{
          content: (
            <ReadinessWizardNavItem
              checked={computeIsReady}
              loaded={computeLoaded}
              title={t('Compute compatibility')}
            />
          ),
        }}
      >
        <ComputeCompatibility nodesArchs={nodesArchs} vmArchs={vmsArchs} />
      </WizardStep>
      <WizardStep
        id="version-compatibility"
        name={t('Version compatibility')}
        navItem={{
          content: (
            <ReadinessWizardNavItem
              checked={versionIsReady}
              loaded={versionLoaded}
              title={t('Version compatibility')}
            />
          ),
        }}
      >
        <VersionCompatibility
          sourceClusterVersion={sourceClusterVersion}
          sourceKubevirtVersion={sourceKubevirtVersion}
          targetClusterVersion={targetClusterVersion}
          targetKubevirtVersion={targetKubevirtVersion}
        />
      </WizardStep>
    </Wizard>
  );
};

export default ReadinessWizardSteps;
