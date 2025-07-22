import React, { FC, useCallback, useEffect } from 'react';
import { Updater } from 'use-immer';

import { V1beta1Plan } from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTargetNamespace,
  getTargetProviderName,
} from '@kubevirt-utils/resources/plan/selectors';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Bullseye, Form, FormGroup, Split, SplitItem, Title } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useClustersAndProjects from '../hooks/useClustersAndProjects';

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

  const selectedClusterTarget = getTargetProviderName(migrationPlan);
  const selectedProjectTarget = getTargetNamespace(migrationPlan);

  const {
    clustersError,
    clustersLoaded,
    clustersOptions,
    projectOptions,
    projectsError,
    projectsLoaded,
  } = useClustersAndProjects(sourceCluster, selectedClusterTarget);

  useEffect(() => {
    if (clustersOptions?.length) {
      setMigrationPlan((plan) => {
        plan.spec.provider.destination.name = clustersOptions?.[0]?.value;
      });
    }
  }, [clustersOptions, setMigrationPlan]);

  const onClusterChange = useCallback(
    (newClusterTarget: string) => {
      setMigrationPlan((plan) => {
        plan.spec.provider.destination.name = newClusterTarget;
      });
    },
    [setMigrationPlan],
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
    <StateHandler error={clustersError} hasData loaded={clustersLoaded}>
      <Title className="cross-cluster-migration-title" headingLevel="h4">
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

            <StateHandler error={projectsError} hasData loaded={projectsLoaded}>
              <FormGroup label={t('Project')}>
                <InlineFilterSelect
                  options={projectOptions}
                  selected={selectedProjectTarget}
                  selectProps={{ id: 'target-project-select' }}
                  setSelected={onProjectChange}
                  toggleProps={{ isFullWidth: true }}
                />
              </FormGroup>
            </StateHandler>
          </SplitItem>
        </Split>
      </Form>
    </StateHandler>
  );
};

export default TargetStep;
