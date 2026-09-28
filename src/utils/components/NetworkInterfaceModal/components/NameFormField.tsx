import { type Dispatch, type FC, type SetStateAction } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

type NameFormFieldProps = {
  isNicNameTaken: boolean;
  objName: string;
  setObjName: Dispatch<SetStateAction<string>>;
  vm: V1VirtualMachine;
};

const NameFormField: FC<NameFormFieldProps> = ({ isNicNameTaken, objName, setObjName }) => {
  const { t } = useKubevirtTranslation();

  const isEmptyName = objName === '';
  const showError = isEmptyName || isNicNameTaken;
  const validated = showError ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        onChange={(_event, value: string) => setObjName(value)}
        type="text"
        validated={validated}
        value={objName}
      />
      {showError && (
        <FormGroupHelperText validated={validated}>
          {isEmptyName
            ? getFieldRequiredMessage(t)
            : t('This name is already used by another network interface')}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default NameFormField;
