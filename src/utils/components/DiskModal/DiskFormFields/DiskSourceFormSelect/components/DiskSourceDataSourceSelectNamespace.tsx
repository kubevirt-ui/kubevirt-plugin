import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect as FilterProjectSelect } from '../../utils/Filters';

type DiskSourceDataSourceSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  projectsLoaded: boolean;
  projectsNames: string[];
  selectedProject: string;
};

const DiskSourceDataSourceSelectNamespace: React.FC<DiskSourceDataSourceSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  projectsLoaded,
  projectsNames,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setIsOpen(false);
    },
    [onChange],
  );

  const fieldId = 'ds-project-select';
  const dsLabel = DataSourceModel.label;

  return (
    <FormGroup
      className="ds-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('{{dsLabel}} project', { dsLabel })}
    >
      {projectsLoaded ? (
        <Select
          aria-labelledby={fieldId}
          hasInlineFilter
          isDisabled={isDisabled}
          isOpen={isOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={FilterProjectSelect(projectsNames)}
          onSelect={onSelect}
          onToggle={setIsOpen}
          placeholderText={t('--- Select {{dsLabel}} project ---', { dsLabel })}
          selections={selectedProject}
          variant={SelectVariant.single}
        >
          {projectsNames.map((projectName) => (
            <SelectOption key={projectName} value={projectName}>
              <ResourceLink kind={ProjectModel.kind} linkTo={false} name={projectName} />
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourceDataSourceSelectNamespace;
