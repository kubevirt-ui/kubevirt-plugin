import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { FilterPVCSelect as FilterProjectsSelect } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/Filters';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

type ProjectSelectInputProps = {
  project: string;
  setProject: React.Dispatch<React.SetStateAction<string>>;
  projectNames: string[];
  projectsLoaded: boolean;
};

const ProjectSelectInput: React.FC<ProjectSelectInputProps> = ({
  project,
  setProject,
  projectNames,
  projectsLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const onSelect = React.useCallback((event, selection) => {
    setProject(selection);
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!projectsLoaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }
  return (
    <FormGroup label={t('Namespace')} fieldId="namespace" isRequired>
      <Select
        menuAppendTo="parent"
        id="namespace"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={onSelect}
        variant={SelectVariant.single}
        onFilter={FilterProjectsSelect(projectNames)}
        hasInlineFilter
        selections={project}
        maxHeight={400}
      >
        {projectNames?.map((projectName) => (
          <SelectOption key={projectName} value={projectName}>
            <ResourceLink kind={ProjectModel.kind} name={projectName} linkTo={false} />
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default ProjectSelectInput;
