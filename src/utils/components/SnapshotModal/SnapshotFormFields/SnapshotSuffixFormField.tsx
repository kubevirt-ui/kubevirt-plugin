import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import FormGroupHelperText from '../../FormGroupHelperText/FormGroupHelperText';
import HelpTextIcon from '../../HelpTextIcon/HelpTextIcon';

type SnapshotSuffixFormFieldProps = {
  isSuffixValid: boolean;
  isSuffixValidDNS1123Label: boolean;
  isSuffixValidLength: boolean;
  maxSuffixLength: number;
  setSnapshotSuffix: (suffix: string) => void;
  snapshotSuffix: string;
};

const SnapshotSuffixFormField: FC<SnapshotSuffixFormFieldProps> = ({
  isSuffixValid,
  isSuffixValidDNS1123Label,
  isSuffixValidLength,
  maxSuffixLength,
  setSnapshotSuffix,
  snapshotSuffix,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      fieldId="suffix"
      isRequired
      label={t('Suffix')}
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t(
                'The resulting snapshot name will be formatted as {VM name}-{random 6 characters}-{suffix}.',
              )}
              hide={hide}
              promptType={OLSPromptType.SNAPSHOTS}
            />
          )}
        />
      }
    >
      <TextInput
        id="suffix"
        onChange={(_event, newName: string) => setSnapshotSuffix(newName)}
        type="text"
        validated={isSuffixValid ? ValidatedOptions.default : ValidatedOptions.error}
        value={snapshotSuffix}
      />
      {!snapshotSuffix && (
        <FormGroupHelperText validated={ValidatedOptions.error}>
          {t('Suffix cannot be empty')}
        </FormGroupHelperText>
      )}
      {!isSuffixValidLength && (
        <FormGroupHelperText validated={ValidatedOptions.error}>
          {t('Suffix cannot be longer than {{maxSuffixLength}} characters', {
            maxSuffixLength,
          })}
        </FormGroupHelperText>
      )}
      {snapshotSuffix && !isSuffixValidDNS1123Label && (
        <FormGroupHelperText validated={ValidatedOptions.error}>
          {getDNS1123LabelError(snapshotSuffix)?.(t)}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default SnapshotSuffixFormField;
