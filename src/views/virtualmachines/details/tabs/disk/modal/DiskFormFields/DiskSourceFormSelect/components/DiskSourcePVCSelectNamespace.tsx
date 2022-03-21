import * as React from 'react';

import { PersistentVolumeClaimModel, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNamespaceProps = {
  projectsName: string[];
  selectedProject: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectNamespace: React.FC<DiskSourcePVCSelectNamespaceProps> = ({
  selectedProject,
  projectsName,
  onChange,
  isDisabled,
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
      label={t('Persistent Volume Claim project')}
      fieldId={fieldId}
      id={fieldId}
      isRequired
      className="pvc-selection-formgroup"
    >
      <Select
        menuAppendTo="parent"
        aria-labelledby={fieldId}
        isOpen={isNamespacePVCOpen}
        onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
        onSelect={onSelect}
        variant={SelectVariant.single}
        onFilter={FilterPVCSelect(projectsName)}
        hasInlineFilter
        selections={selectedProject}
        placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} project ---`)}
        isDisabled={isDisabled}
        maxHeight={400}
      >
        {projectsName.map((projectName) => (
          <SelectOption key={projectName} value={projectName}>
            <ResourceLink kind={ProjectModel.kind} name={projectName} linkTo={false} />
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
