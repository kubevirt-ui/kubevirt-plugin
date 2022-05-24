import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

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
  'data-test-id': string;
};

export const PersistentVolumeSelectProject: React.FC<PersistentVolumeSelectProjectProps> = ({
  selectedProject,
  projectsName,
  onChange: onProjectChange,
  'data-test-id': testId,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext();
  const [isNamespacePVCOpen, setNamespaceOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onProjectChange(selection);
      setNamespaceOpen(false);
    },
    [onProjectChange],
  );

  return (
    <FormGroup
      label={t('Persistent Volume Claim project')}
      fieldId={testId}
      id={testId}
      isRequired
      className="pvc-selection-formgroup"
    >
      <Controller
        name="pvcNamespace"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange }, fieldState: { error } }) => (
          <div data-test-id={`${testId}-dropdown`}>
            <Select
              aria-labelledby={testId}
              isOpen={isNamespacePVCOpen}
              onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
              onSelect={(e, v) => {
                onSelect(e, v);
                onChange(v);
              }}
              variant={SelectVariant.single}
              onFilter={filter(projectsName)}
              hasInlineFilter
              selections={selectedProject}
              placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} project ---`)}
              validated={error ? ValidatedOptions.error : ValidatedOptions.default}
              aria-invalid={error ? true : false}
              maxHeight={400}
              data-test-id={`${testId}-dropdown`}
              toggleId={`${testId}-toggle`}
            >
              {projectsName.map((projectName) => (
                <SelectOption
                  key={projectName}
                  value={projectName}
                  data-test-id={`${testId}-dropdown-option-${projectName}`}
                >
                  <span className="sr-only">{t('project')}</span>
                  <span className="co-m-resource-icon co-m-resource-project">PR</span> {projectName}
                </SelectOption>
              ))}
            </Select>
          </div>
        )}
      />
    </FormGroup>
  );
};
