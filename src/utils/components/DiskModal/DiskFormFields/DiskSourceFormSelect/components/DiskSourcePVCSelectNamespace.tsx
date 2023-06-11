import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  projectsLoaded: boolean;
  projectsName: string[];
  selectedProject: string;
};

const DiskSourcePVCSelectNamespace: React.FC<DiskSourcePVCSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  projectsLoaded,
  projectsName,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();
  const [isNamespacePVCOpen, setNamespaceOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setNamespaceOpen(false);
    },
    [onChange],
  );

  const fieldId = 'pvc-project-select';

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      helperText={t('Location of the existing PVC')}
      id={fieldId}
      isRequired
      label={t('PVC project')}
    >
      {projectsLoaded ? (
        <Select
          aria-labelledby={fieldId}
          hasInlineFilter
          isDisabled={isDisabled}
          isOpen={isNamespacePVCOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={FilterPVCSelect(projectsName)}
          onSelect={onSelect}
          onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
          placeholderText={t('--- Select PVC project ---')}
          selections={selectedProject}
          variant={SelectVariant.single}
        >
          {projectsName.map((projectName) => (
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

export default DiskSourcePVCSelectNamespace;
