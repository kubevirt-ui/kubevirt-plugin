import React, { type FC } from 'react';
import { type TFunction } from 'i18next';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Spinner,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { ArrowRightIcon, WrenchIcon } from '@patternfly/react-icons';

import { type MigrationTargetResponse } from '../hooks/useClusterRecommendationTypes';
import ClusterRecommendationPanel from './ClusterRecommendationPanel';

type TargetStepFormProps = {
  advisorBaseURL: null | string;
  clustersOptions: EnhancedSelectOptionProps[];
  fetchRecommendation: () => void;
  onClusterChange: (cluster: string) => void;
  onProjectChange: (project: string) => void;
  onRecommendationSelect: (cluster: string) => void;
  projectOptions: EnhancedSelectOptionProps[];
  projectsLoaded: boolean;
  recData: MigrationTargetResponse | null;
  recError: Error | null;
  recLoaded: boolean;
  recLoading: boolean;
  selectedClusterTarget: string;
  selectedProjectTarget: string;
  sourceCluster: string;
  sourceNamespace: string;
  t: TFunction;
};

const TargetStepForm: FC<TargetStepFormProps> = ({
  advisorBaseURL,
  clustersOptions,
  fetchRecommendation,
  onClusterChange,
  onProjectChange,
  onRecommendationSelect,
  projectOptions,
  projectsLoaded,
  recData,
  recError,
  recLoaded,
  recLoading,
  selectedClusterTarget,
  selectedProjectTarget,
  sourceCluster,
  sourceNamespace,
  t,
}) => (
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
    {advisorBaseURL && (
      <Button
        icon={<WrenchIcon />}
        isDisabled={recLoading}
        onClick={fetchRecommendation}
        variant={ButtonVariant.secondary}
      >
        {t('Get cluster recommendation')}
      </Button>
    )}
    <ClusterRecommendationPanel
      data={recData}
      error={recError}
      loaded={recLoaded}
      loading={recLoading}
      onSelectCluster={onRecommendationSelect}
    />
  </Form>
);

export default TargetStepForm;
