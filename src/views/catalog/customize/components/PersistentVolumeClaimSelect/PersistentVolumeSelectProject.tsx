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
  'data-test-id': string;
  loaded: boolean;
  onChange: (newProject: string) => void;
  projectsName: string[];
  selectedProject: string;
};

export const PersistentVolumeSelectProject: React.FC<PersistentVolumeSelectProjectProps> = ({
  'data-test-id': testId,
  loaded,
  onChange: onProjectChange,
  projectsName,
  selectedProject,
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
      className="pvc-selection-formgroup"
      fieldId={testId}
      helperText={t('Location of the existing PVC')}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      id={testId}
      isRequired
      label={t('PVC project')}
      validated={errors?.['pvcNamespace'] ? ValidatedOptions.error : ValidatedOptions.default}
    >
      {loaded ? (
        <Controller
          render={({ field: { onChange }, fieldState: { error } }) => (
            <div data-test-id={`${testId}-dropdown`}>
              <Select
                onSelect={(e, v) => {
                  onSelect(e, v);
                  onChange(v);
                }}
                aria-invalid={error ? true : false}
                aria-labelledby={testId}
                data-test-id={`${testId}-dropdown`}
                hasInlineFilter
                isOpen={isNamespacePVCOpen}
                maxHeight={400}
                onFilter={filter(projectsName)}
                onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
                placeholderText={t('--- Select PVC project ---')}
                selections={selectedProject}
                toggleId={`${testId}-toggle`}
                validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                variant={SelectVariant.single}
              >
                {projectsName.map((projectName) => (
                  <SelectOption data-test-id={projectName} key={projectName} value={projectName}>
                    <span className="sr-only">{t('project')}</span>
                    <span className="co-m-resource-icon co-m-resource-project">PR</span>{' '}
                    {projectName}
                  </SelectOption>
                ))}
              </Select>
            </div>
          )}
          control={control}
          name="pvcNamespace"
          rules={{ required: true }}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};
