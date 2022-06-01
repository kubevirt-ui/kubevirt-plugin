import * as React from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

type SelectProjectProps = {
  setSelectedProject: (newProject: string) => void;
  selectedProject: string;
  id?: string;
};

const SelectProject: React.FC<SelectProjectProps> = ({
  setSelectedProject,
  selectedProject,
  id,
}) => {
  const { t } = useKubevirtTranslation();
  const [isProjectSelectOpen, setProjectSelectOpen] = React.useState(false);

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const filterNamespaces = (_, value: string): React.ReactElement[] => {
    let filteredProjects = projects;

    if (value) {
      const regex = new RegExp(value, 'i');
      filteredProjects = projects.filter((project) => regex.test(project?.metadata?.name));
    }

    return filteredProjects.map((project) => (
      <SelectOption key={project?.metadata?.name} value={project?.metadata?.name} />
    )) as React.ReactElement[];
  };

  const onSelect = (event, newValue) => {
    setSelectedProject(newValue);
    setProjectSelectOpen(false);
  };

  if (!projectsLoaded) <Loading />;

  return (
    <Select
      menuAppendTo="parent"
      isOpen={isProjectSelectOpen}
      onToggle={() => setProjectSelectOpen(!isProjectSelectOpen)}
      onSelect={onSelect}
      variant={SelectVariant.single}
      onFilter={filterNamespaces}
      hasInlineFilter
      selections={selectedProject}
      placeholderText={t('--- Select project ---')}
      maxHeight={400}
      id={id}
    >
      {projects.map((project) => (
        <SelectOption key={project.metadata.name} value={project.metadata.name}>
          <ResourceLink kind={ProjectModel.kind} name={project.metadata.name} linkTo={false} />
        </SelectOption>
      ))}
    </Select>
  );
};

export default SelectProject;
