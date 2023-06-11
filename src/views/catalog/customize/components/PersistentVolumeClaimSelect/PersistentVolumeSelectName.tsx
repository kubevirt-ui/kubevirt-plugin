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
  'data-test-id': string;
  isDisabled: boolean;
  loaded: boolean;
  onChange: (newPVCName: string) => void;
  pvcNames: string[];
  pvcNameSelected: string;
};

export const PersistentVolumeSelectName: React.FC<PersistentVolumeSelectNameProps> = ({
  'data-test-id': testId,
  isDisabled,
  loaded,
  onChange: onPvcNameChange,
  pvcNames,
  pvcNameSelected,
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
      className="pvc-selection-formgroup"
      fieldId={testId}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      id={testId}
      isRequired
      label={t('PVC name')}
      validated={errors?.['pvcName'] ? ValidatedOptions.error : ValidatedOptions.default}
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
                isDisabled={isDisabled}
                isOpen={isOpen}
                maxHeight={400}
                onFilter={filter(pvcNames)}
                onToggle={() => setSelectOpen(!isOpen)}
                placeholderText={t('--- Select PVC name ---')}
                selections={pvcNameSelected}
                toggleId={`${testId}-toggle`}
                validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                variant={SelectVariant.typeahead}
              >
                {pvcNames.map((name) => (
                  <SelectOption data-test-id={pvcNames} key={name} value={name} />
                ))}
              </Select>
            </div>
          )}
          control={control}
          name="pvcName"
          rules={{ required: true }}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};
