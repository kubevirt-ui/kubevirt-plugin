import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import FilterSelect from '../FilterSelect/FilterSelect';
import Loading from '../Loading/Loading';

type SelectProjectProps = {
  selectedProject: string;
  setSelectedProject: (newProject: string) => void;
};

const SelectProject: FC<SelectProjectProps> = ({ selectedProject, setSelectedProject }) => {
  const { t } = useKubevirtTranslation();

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  if (!projectsLoaded) return <Loading />;

  return (
    <FilterSelect
      options={projects?.map((project) => ({
        children: getName(project),
        groupVersionKind: modelToGroupVersionKind(ProjectModel),
        value: getName(project),
      }))}
      selected={selectedProject}
      setSelected={setSelectedProject}
      toggleProps={{ isFullWidth: true, placeholder: t('Select project') }}
    />
  );
};

export default SelectProject;
