import { type FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SplitItem, Title } from '@patternfly/react-core';

type SourceInputProps = {
  clustersOptions: EnhancedSelectOptionProps[];
  sourceCluster: string;
  sourceNamespace: string;
};

const SourceInput: FC<SourceInputProps> = ({ clustersOptions, sourceCluster, sourceNamespace }) => {
  const { t } = useKubevirtTranslation();

  return (
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
  );
};

export default SourceInput;
