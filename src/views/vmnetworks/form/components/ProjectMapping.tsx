import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PROJECT_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjectResources from '@kubevirt-utils/hooks/useProjectResources';
import { Radio, Stack, Title } from '@patternfly/react-core';

import { ProjectMappingOption, VMNetworkForm } from '../constants';

import ProjectList from './ProjectList';
import ProjectNamespaceSelector from './ProjectNamespaceSelector';

type ProjectMappingProps = {
  isEditModal?: boolean;
};

const ProjectMapping: FC<ProjectMappingProps> = ({ isEditModal = false }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<VMNetworkForm>();

  const projectMappingOption = watch('projectMappingOption');

  const [projects, loadedProjects, errorLoadingProjects] = useProjectResources();

  return (
    <>
      {!isEditModal && (
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Project mapping')}</Title>
          <p>{t('Link your new network to specific OpenShift projects.')}</p>
        </Stack>
      )}

      {/* Make this network available for all projects = configure with default namespace selector */}
      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', {
                matchLabels: { [PROJECT_NAME_LABEL_KEY]: DEFAULT_NAMESPACE },
              });
              onChange(ProjectMappingOption.AllProjects);
            }}
            id="project-all"
            isChecked={projectMappingOption === ProjectMappingOption.AllProjects}
            label={t('Make this network available for all projects')}
            name="project-mapping"
          />
        )}
        control={control}
        name="projectMappingOption"
      />

      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', { matchExpressions: [] });
              onChange(ProjectMappingOption.SelectFromList);
            }}
            id="project-list"
            isChecked={projectMappingOption === ProjectMappingOption.SelectFromList}
            label={t('Select projects from list')}
            name="project-mapping"
          />
        )}
        control={control}
        name="projectMappingOption"
      />

      {projectMappingOption === ProjectMappingOption.SelectFromList && (
        <ProjectList
          errorLoadingProjects={errorLoadingProjects}
          loadedProjects={loadedProjects}
          projects={projects}
        />
      )}

      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', { matchLabels: {} });
              onChange(ProjectMappingOption.SelectByLabels);
            }}
            description={t('Ensure the projects for this network have the labels you specified.')}
            id="project-labels"
            isChecked={projectMappingOption === ProjectMappingOption.SelectByLabels}
            label={t('Select labels to specify qualifying projects')}
            name="project-mapping"
          />
        )}
        control={control}
        name="projectMappingOption"
      />

      {projectMappingOption === ProjectMappingOption.SelectByLabels && <ProjectNamespaceSelector />}
    </>
  );
};

export default ProjectMapping;
