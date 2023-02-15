import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
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
  loaded: boolean;
  'data-test-id': string;
};

export const PersistentVolumeSelectProject: React.FC<PersistentVolumeSelectProjectProps> = ({
  selectedProject,
  projectsName,
  onChange: onProjectChange,
  loaded,
  'data-test-id': testId,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext();
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
      label={t('PVC project')}
      fieldId={testId}
      id={testId}
      isRequired
      className="pvc-selection-formgroup"
      validated={errors?.['pvcNamespace'] ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      helperText={t('Location of the existing PVC')}
    >
      {loaded ? (
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
                placeholderText={t('--- Select PVC project ---')}
                validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                aria-invalid={error ? true : false}
                maxHeight={400}
                data-test-id={`${testId}-dropdown`}
                toggleId={`${testId}-toggle`}
              >
                {projectsName.map((projectName) => (
                  <SelectOption key={projectName} value={projectName} data-test-id={projectName}>
                    <span className="sr-only">{t('project')}</span>
                    <span className="co-m-resource-icon co-m-resource-project">PR</span>{' '}
                    {projectName}
                  </SelectOption>
                ))}
              </Select>
            </div>
          )}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};
