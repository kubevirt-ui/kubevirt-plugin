import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  ValidatedOptions,
} from '@patternfly/react-core';

import { filter } from './utils';

type PersistentVolumeSelectProjectProps = {
  onChange: (newProject: string) => void;
  projectsName: string[];
  selectedProject: string;
};

export const PersistentVolumeSelectProject: React.FC<PersistentVolumeSelectProjectProps> = ({
  onChange,
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
      <Select
        aria-invalid={!selectedProject ? true : false}
        aria-labelledby={fieldId}
        hasInlineFilter
        isOpen={isNamespacePVCOpen}
        maxHeight={400}
        menuAppendTo="parent"
        onFilter={filter(projectsName)}
        onSelect={onSelect}
        onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
        placeholderText={t('--- Select PVC project ---')}
        selections={selectedProject}
        validated={!selectedProject ? ValidatedOptions.error : ValidatedOptions.default}
        variant={SelectVariant.single}
      >
        {projectsName.map((projectName) => (
          <SelectOption key={projectName} value={projectName}>
            <span className="sr-only">{t('project')}</span>
            <span className="co-m-resource-icon co-m-resource-project">PR</span> {projectName}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};
