import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

type PersistentVolumeSelectProjectProps = {
  onChange: (newProject: string) => void;
  projectsName: string[];
  selectedProject: string;
};

export const PersistentVolumeSelectProject: FC<PersistentVolumeSelectProjectProps> = ({
  onChange,
  projectsName,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-project-select';

  const validated = !selectedProject ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('PVC project')}
    >
      <FilterSelect
        options={projectsName?.map((name) => ({
          children: name,
          groupVersionKind: modelToGroupVersionKind(ProjectModel),
          value: name,
        }))}
        toggleProps={{
          isFullHeight: true,
          placeholder: t('--- Select PVC project ---'),
        }}
        selected={selectedProject}
        setSelected={onChange}
      />
      <FormGroupHelperText validated={validated}>
        {validated === ValidatedOptions.default && t('Location of the existing PVC')}
      </FormGroupHelperText>
    </FormGroup>
  );
};
