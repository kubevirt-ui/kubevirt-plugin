import * as React from 'react';
import { Trans } from 'react-i18next';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { FilterPVCSelect as FilterProjectsSelect } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/Filters';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { DOC_URL_ENABLING_USER_CLONE_PERMISSIONS } from '../utils/constants';

type ProjectSelectInputProps = {
  project: string;
  setProject: React.Dispatch<React.SetStateAction<string>>;
  projectNames: string[];
  projectsLoaded: boolean;
  vmNamespace: string;
};

const ProjectSelectInput: React.FC<ProjectSelectInputProps> = ({
  project,
  setProject,
  projectNames,
  projectsLoaded,
  vmNamespace,
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
    <FormGroup
      label={t('Namespace')}
      fieldId="namespace"
      isRequired
      helperText={
        vmNamespace !== project && (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Make sure to have clone permissions in the destination namespace.{' '}
            <a
              href={DOC_URL_ENABLING_USER_CLONE_PERMISSIONS}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more <ExternalLinkAltIcon />
            </a>
          </Trans>
        )
      }
    >
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
