import * as React from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

type SelectProjectProps = {
  id?: string;
  selectedProject: string;
  setSelectedProject: (newProject: string) => void;
};

const SelectProject: React.FC<SelectProjectProps> = ({
  id,
  selectedProject,
  setSelectedProject,
}) => {
  const { t } = useKubevirtTranslation();
  const [isProjectSelectOpen, setProjectSelectOpen] = React.useState(false);

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
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
      hasInlineFilter
      id={id}
      isOpen={isProjectSelectOpen}
      maxHeight={400}
      menuAppendTo="parent"
      onFilter={filterNamespaces}
      onSelect={onSelect}
      onToggle={() => setProjectSelectOpen(!isProjectSelectOpen)}
      placeholderText={t('--- Select project ---')}
      selections={selectedProject}
      variant={SelectVariant.single}
    >
      {projects.map((project) => (
        <SelectOption key={project.metadata.name} value={project.metadata.name}>
          <ResourceLink kind={ProjectModel.kind} linkTo={false} name={project.metadata.name} />
        </SelectOption>
      ))}
    </Select>
  );
};

export default SelectProject;
