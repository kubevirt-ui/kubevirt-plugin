import React, { type FC, useCallback, useEffect, useMemo } from 'react';
import { type Updater } from 'use-immer';

import { type V1beta1Plan } from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTargetNamespace,
  getTargetProviderName,
} from '@kubevirt-utils/resources/plan/selectors';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Title } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { getClusterFromProvider } from '../utils';

import useAdvisorRouteURL from '../hooks/useAdvisorRouteURL';
import useClusterRecommendation from '../hooks/useClusterRecommendation';
import useClustersAndProjects from '../hooks/useClustersAndProjects';
import TargetStepForm from './TargetStepForm';

import './TargetStep.scss';

type TargetStepProps = {
  migrationPlan: V1beta1Plan;
  setMigrationPlan: Updater<V1beta1Plan>;
  vms: V1VirtualMachine[];
};

const TargetStep: FC<TargetStepProps> = ({ migrationPlan, setMigrationPlan, vms }) => {
  const { t } = useKubevirtTranslation();
  const [hubClusterName] = useHubClusterName();
  const sourceCluster = getCluster(vms?.[0]) ?? hubClusterName;
  const sourceNamespace = getNamespace(vms?.[0]);

  const [advisorBaseURL] = useAdvisorRouteURL();
  const vmQueryParams = useMemo(
    () => ({
      cluster: sourceCluster,
      vmName: getName(vms?.[0]),
      vmNamespace: sourceNamespace,
    }),
    [sourceCluster, vms, sourceNamespace],
  );
  const {
    data: recData,
    error: recError,
    fetchRecommendation,
    loaded: recLoaded,
    loading: recLoading,
  } = useClusterRecommendation(advisorBaseURL, vmQueryParams);

  const selectedProviderTarget = getTargetProviderName(migrationPlan);
  const selectedClusterTarget = getClusterFromProvider(selectedProviderTarget);
  const selectedProjectTarget = getTargetNamespace(migrationPlan);

  const {
    clustersError,
    clustersLoaded,
    clustersOptions,
    getProviderFromClusterName,
    projectOptions,
    projectsError,
    projectsLoaded,
    providers,
  } = useClustersAndProjects(sourceCluster, selectedClusterTarget);

  useEffect(() => {
    if (!clustersOptions?.length || selectedProviderTarget) return;

    setMigrationPlan((plan) => {
      const sourceProvider = getProviderFromClusterName(sourceCluster);
      plan.spec.provider.source.name = getName(sourceProvider);
      plan.spec.provider.source.uid = getUID(sourceProvider);
      plan.spec.provider.source.namespace = getNamespace(sourceProvider);

      if (!advisorBaseURL) {
        const selectedProvider = getProviderFromClusterName(clustersOptions?.[0]?.value);
        plan.spec.provider.destination.name = getName(selectedProvider);
        plan.spec.provider.destination.uid = getUID(selectedProvider);
        plan.spec.provider.destination.namespace = getNamespace(selectedProvider);
      }
    });
  }, [
    advisorBaseURL,
    clustersOptions,
    setMigrationPlan,
    selectedProviderTarget,
    sourceCluster,
    getProviderFromClusterName,
  ]);

  const onClusterChange = useCallback(
    (newClusterTarget: string) => {
      setMigrationPlan((plan) => {
        const selectedProvider = getProviderFromClusterName(newClusterTarget);
        plan.spec.provider.destination.name = getName(selectedProvider);
        plan.spec.provider.destination.namespace = getNamespace(selectedProvider);
        plan.spec.provider.destination.uid = getUID(selectedProvider);
      });
    },
    [setMigrationPlan, getProviderFromClusterName],
  );

  const onProjectChange = useCallback(
    (newProjectTarget: string) => {
      setMigrationPlan((plan) => {
        plan.spec.targetNamespace = newProjectTarget;
      });
    },
    [setMigrationPlan],
  );

  const onRecommendationSelect = useCallback(
    (clusterName: string) => {
      onClusterChange(clusterName);
    },
    [onClusterChange],
  );

  return (
    <StateHandler
      error={clustersError ?? projectsError}
      hasData={!isEmpty(providers)}
      loaded={clustersLoaded}
    >
      <Title className="cross-cluster-migration-title" headingLevel="h2" size="lg">
        {t('Target placement')}
      </Title>
      <TargetStepForm
        advisorBaseURL={advisorBaseURL}
        clustersOptions={clustersOptions}
        fetchRecommendation={fetchRecommendation}
        onClusterChange={onClusterChange}
        onProjectChange={onProjectChange}
        onRecommendationSelect={onRecommendationSelect}
        projectOptions={projectOptions}
        projectsLoaded={projectsLoaded}
        recData={recData}
        recError={recError}
        recLoaded={recLoaded}
        recLoading={recLoading}
        selectedClusterTarget={selectedClusterTarget}
        selectedProjectTarget={selectedProjectTarget}
        sourceCluster={sourceCluster}
        sourceNamespace={sourceNamespace}
        t={t}
      />
    </StateHandler>
  );
};

export default TargetStep;
