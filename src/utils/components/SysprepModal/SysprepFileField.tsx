import * as React from 'react';
import { XMLValidator } from 'fast-xml-parser';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FileUpload, Text, TextVariants, ValidatedOptions } from '@patternfly/react-core';

export type SysprepFile = {
  isLoading: boolean;
  fileName: string;
  validated: ValidatedOptions;
  value: string;
};

type SysprepFileFieldProps = {
  id: string;
  value?: string;
  onChange: (value: string) => void;
};

const SysprepFileField: React.FC<SysprepFileFieldProps> = ({ id, value, onChange }) => {
  const { t } = useKubevirtTranslation();
  const [data, setData] = React.useState<SysprepFile>({
    validated: ValidatedOptions.default,
    fileName: '',
    value,
    isLoading: false,
  });

  const onFieldChange = (newValue: string, fileName: string) => {
    setData((currentSysprepFile) => ({
      ...currentSysprepFile,
      validated:
        XMLValidator.validate(newValue) === true
          ? ValidatedOptions.default
          : ValidatedOptions.error,
      value: newValue,
      fileName,
    }));
  };

  React.useEffect(() => {
    if (data.validated) {
      onChange(data.value);
    }
  }, [data.validated, data.value, onChange]);

  return (
    <>
      <FileUpload
        id={`sysprep-${id}-input`}
        data-test={`sysprep-${id.toLowerCase().replace('.', '-')}-input`}
        type="text"
        value={data.value}
        filename={data.fileName}
        onChange={onFieldChange}
        onReadStarted={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: true }))
        }
        onReadFinished={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: false }))
        }
        isLoading={data.isLoading}
        validated={
          data.validated !== ValidatedOptions.error
            ? ValidatedOptions.default
            : ValidatedOptions.error
        }
        allowEditingUploadedText
        isReadOnly={false}
      />
      {data.validated === ValidatedOptions.error && (
        <Text component={TextVariants.p} className="kv-sysprep--error">
          {t('XML structure is not valid')}
        </Text>
      )}
    </>
  );
};

export default SysprepFileField;
