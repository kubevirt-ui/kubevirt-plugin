import React, { FC, useCallback, useEffect } from 'react';
import { Updater } from 'use-immer';

import { V1beta1Plan } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTargetNamespace,
  getTargetProviderName,
} from '@kubevirt-utils/resources/plan/selectors';
import { getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Bullseye,
  Form,
  FormGroup,
  Spinner,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useClustersAndProjects from '../hooks/useClustersAndProjects';
import { getClusterFromProvider } from '../utils';

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
    if (clustersOptions?.length && !selectedProviderTarget) {
      setMigrationPlan((plan) => {
        const selectedProvider = getProviderFromClusterName(clustersOptions?.[0]?.value);
        plan.spec.provider.destination.name = getName(selectedProvider);
        plan.spec.provider.destination.uid = getUID(selectedProvider);
        plan.spec.provider.destination.namespace = getNamespace(selectedProvider);

        const sourceProvider = getProviderFromClusterName(sourceCluster);
        plan.spec.provider.source.name = getName(sourceProvider);
        plan.spec.provider.source.uid = getUID(sourceProvider);
        plan.spec.provider.source.namespace = getNamespace(sourceProvider);
      });
    }
  }, [
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

  return (
    <StateHandler
      error={clustersError || projectsError}
      hasData={!isEmpty(providers)}
      loaded={clustersLoaded}
    >
      <Title className="cross-cluster-migration-title" headingLevel="h2" size="lg">
        {t('Target placement')}
      </Title>
      <Form>
        <Split hasGutter>
          <SplitItem className="crossclustermigration-target-step__box" isFilled>
            <Title headingLevel="h5">{t('Source')}</Title>

            <FormGroup label={t('Cluster')}>
              <InlineFilterSelect
                options={clustersOptions}
                selected={sourceCluster}
                selectProps={{ id: 'source-cluster-select' }}
                setSelected={undefined}
                toggleProps={{ children: sourceCluster, isDisabled: true, isFullWidth: true }}
              />
            </FormGroup>

            <FormGroup label={t('Project')}>
              <InlineFilterSelect
                options={[]}
                selected={sourceNamespace}
                selectProps={{ id: 'source-project-select' }}
                setSelected={undefined}
                toggleProps={{ children: sourceNamespace, isDisabled: true, isFullWidth: true }}
              />
            </FormGroup>
          </SplitItem>
          <SplitItem>
            <Bullseye>
              <ArrowRightIcon />
            </Bullseye>
          </SplitItem>
          <SplitItem className="crossclustermigration-target-step__box" isFilled>
            <Title headingLevel="h5">{t('Target')}</Title>

            <FormGroup label={t('Cluster')}>
              <InlineFilterSelect
                options={clustersOptions}
                selected={selectedClusterTarget}
                selectProps={{ id: 'target-cluster-select' }}
                setSelected={onClusterChange}
                toggleProps={{ isFullWidth: true }}
              />
            </FormGroup>

            {projectsLoaded ? (
              <FormGroup label={t('Project')}>
                <InlineFilterSelect
                  options={projectOptions}
                  selected={selectedProjectTarget}
                  selectProps={{ id: 'target-project-select' }}
                  setSelected={onProjectChange}
                  toggleProps={{ isFullWidth: true }}
                />
              </FormGroup>
            ) : (
              <Spinner />
            )}
          </SplitItem>
        </Split>
      </Form>
    </StateHandler>
  );
};

export default TargetStep;
