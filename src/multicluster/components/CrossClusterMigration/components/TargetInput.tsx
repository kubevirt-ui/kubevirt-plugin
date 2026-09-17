import { type FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Spinner, SplitItem, Title } from '@patternfly/react-core';

type TargetInputProps = {
  clustersOptions: EnhancedSelectOptionProps[];
  onClusterChange: (cluster: string) => void;
  onProjectChange: (project: string) => void;
  projectOptions: EnhancedSelectOptionProps[];
  projectsLoaded: boolean;
  selectedClusterTarget: string;
  selectedProjectTarget: string;
};

const TargetInput: FC<TargetInputProps> = ({
  clustersOptions,
  onClusterChange,
  onProjectChange,
  projectOptions,
  projectsLoaded,
  selectedClusterTarget,
  selectedProjectTarget,
}) => {
  const { t } = useKubevirtTranslation();

  return (
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
  );
};

export default TargetInput;
