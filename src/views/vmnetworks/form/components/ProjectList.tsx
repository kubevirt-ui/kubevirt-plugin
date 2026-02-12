import React, { FC, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { PROJECT_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, MatchExpression } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Skeleton, Stack } from '@patternfly/react-core';

import { VMNetworkForm } from '../constants';

import SelectedProjects from './SelectedProjects';

type ProjectListProps = {
  errorLoadingProjects: Error;
  loadedProjects: boolean;
  projects: K8sResourceCommon[];
};

const ProjectList: FC<ProjectListProps> = ({ errorLoadingProjects, loadedProjects, projects }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<VMNetworkForm>();

  const matchExpressions = watch('network.spec.namespaceSelector.matchExpressions');

  const transformProjectsIntoMatchExpressions = useCallback(
    (selected: string[]): MatchExpression[] => [
      {
        key: PROJECT_NAME_LABEL_KEY,
        operator: 'In',
        values: selected,
      },
    ],
    [],
  );

  if (!loadedProjects) return <Skeleton />;

  if (errorLoadingProjects)
    return (
      <Alert isInline title={t('Failed to retrieve the list of projects')} variant="danger">
        {errorLoadingProjects?.message ?? ''}
      </Alert>
    );

  return (
    <Stack className="pf-v6-u-pl-md" hasGutter>
      <Controller
        render={({ field: { onChange, value } }) => (
          <MultiSelectTypeahead
            setSelectedResourceNames={(newSelection) => {
              onChange(transformProjectsIntoMatchExpressions(newSelection));
            }}
            allResourceNames={projects.map(getName)}
            hasCheckboxes
            selectedResourceNames={value?.map((expr) => expr.values).flat() || []}
          />
        )}
        control={control}
        name="network.spec.namespaceSelector.matchExpressions"
      />
      {matchExpressions?.length > 0 && <SelectedProjects />}
    </Stack>
  );
};

export default ProjectList;
