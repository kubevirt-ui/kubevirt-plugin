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

type PersistentVolumeSelectNameProps = {
  isDisabled: boolean;
  pvcNameSelected: string;
  pvcNames: string[];
  onChange: (newPVCName: string) => void;
  loaded: boolean;
  'data-test-id': string;
};

export const PersistentVolumeSelectName: React.FC<PersistentVolumeSelectNameProps> = ({
  isDisabled,
  pvcNameSelected,
  pvcNames,
  onChange: onPvcNameChange,
  loaded,
  'data-test-id': testId,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [isOpen, setSelectOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onPvcNameChange(selection);
      setSelectOpen(false);
    },
    [onPvcNameChange],
  );

  return (
    <FormGroup
      label={t('Persistent Volume Claim name')}
      fieldId={testId}
      id={testId}
      isRequired
      className="pvc-selection-formgroup"
      validated={errors?.['pvcName'] ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
    >
      {loaded ? (
        <Controller
          name="pvcName"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange }, fieldState: { error } }) => (
            <div data-test-id={`${testId}-dropdown`}>
              <Select
                aria-labelledby={testId}
                isOpen={isOpen}
                onToggle={() => setSelectOpen(!isOpen)}
                onSelect={(e, v) => {
                  onSelect(e, v);
                  onChange(v);
                }}
                variant={SelectVariant.typeahead}
                selections={pvcNameSelected}
                onFilter={filter(pvcNames)}
                placeholderText={t('--- Select PersistentVolumeClaim name ---')}
                isDisabled={isDisabled}
                validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                aria-invalid={error ? true : false}
                maxHeight={400}
                data-test-id={`${testId}-dropdown`}
                toggleId={`${testId}-toggle`}
              >
                {pvcNames.map((name) => (
                  <SelectOption key={name} value={name} data-test-id={pvcNames} />
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
