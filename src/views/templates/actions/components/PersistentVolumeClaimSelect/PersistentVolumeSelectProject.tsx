import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
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
  projectsName: string[];
  selectedProject: string;
  onChange: (newProject: string) => void;
};

export const PersistentVolumeSelectProject: React.FC<PersistentVolumeSelectProjectProps> = ({
  selectedProject,
  projectsName,
  onChange,
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
        aria-labelledby={fieldId}
        isOpen={isNamespacePVCOpen}
        onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
        onSelect={onSelect}
        variant={SelectVariant.single}
        onFilter={filter(projectsName)}
        hasInlineFilter
        selections={selectedProject}
        placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} project ---`)}
        validated={!selectedProject ? ValidatedOptions.error : ValidatedOptions.default}
        aria-invalid={!selectedProject ? true : false}
        maxHeight={400}
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
