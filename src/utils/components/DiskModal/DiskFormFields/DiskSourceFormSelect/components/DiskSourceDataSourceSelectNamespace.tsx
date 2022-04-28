import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect as FilterProjectSelect } from '../../utils/Filters';

type DiskSourceDataSourceSelectNamespaceProps = {
  projectsName: string[];
  selectedProject: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  projectsLoaded: boolean;
  isDisabled?: boolean;
};

const DiskSourceDataSourceSelectNamespace: React.FC<DiskSourceDataSourceSelectNamespaceProps> = ({
  selectedProject,
  projectsName,
  onChange,
  projectsLoaded,
  isDisabled,
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
      label={t('{{dsLabel}} project', { dsLabel })}
      fieldId={fieldId}
      id={fieldId}
      isRequired
      className="ds-selection-formgroup"
    >
      {projectsLoaded ? (
        <Select
          menuAppendTo="parent"
          aria-labelledby={fieldId}
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          onFilter={FilterProjectSelect(projectsName)}
          hasInlineFilter
          selections={selectedProject}
          placeholderText={t('--- Select {{dsLabel}} project ---', { dsLabel })}
          isDisabled={isDisabled}
          maxHeight={400}
        >
          {projectsName.map((projectName) => (
            <SelectOption key={projectName} value={projectName}>
              <ResourceLink kind={ProjectModel.kind} name={projectName} linkTo={false} />
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
