import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FileUpload } from '@patternfly/react-core';

import { isValidSSHKey, ValidationOption } from '../../utils/cloudint-utils';

import './ssh-form-key.scss';

type CloudInitSSHKeyFormProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

const CloudInitSSHKeyForm: React.FC<CloudInitSSHKeyFormProps> = ({ id, value, onChange }) => {
  const { t } = useKubevirtTranslation();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [validated, setValidated] = React.useState<ValidationOption>(ValidationOption.default);
  const [helperText, setHelperText] = React.useState<string>('');

  React.useEffect(() => {
    setHelperText('');

    if (value) {
      const isKeyValid = isValidSSHKey(value);
      setValidated(isKeyValid ? ValidationOption.success : ValidationOption.error);
      if (!isKeyValid) {
        setHelperText(t('Invalid SSH public key format'));
      }
    } else {
      setValidated(ValidationOption.default);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onInputFileChange = React.useCallback(
    (newValue: string) => {
      onChange(newValue.replace('\n', ''));
    },
    [onChange],
  );

  return (
    <>
      <FileUpload
        id={id}
        className="CloudInitSSHKeyForm-input-field"
        type="text"
        value={value}
        onChange={onInputFileChange}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        isLoading={isLoading}
        validated={validated}
        allowEditingUploadedText
        isReadOnly={false}
      />
      {helperText && <div className="pf-c-form__helper-text pf-m-error">{helperText}</div>}
    </>
  );
};

export default CloudInitSSHKeyForm;
