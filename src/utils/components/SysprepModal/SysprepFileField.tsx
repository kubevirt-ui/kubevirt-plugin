import * as React from 'react';
import { XMLValidator } from 'fast-xml-parser';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FileUpload, Text, TextVariants, ValidatedOptions } from '@patternfly/react-core';

export type SysprepFile = {
  fileName: string;
  isLoading: boolean;
  validated: ValidatedOptions;
  value: string;
};

type SysprepFileFieldProps = {
  id: string;
  onChange: (value: string) => void;
  value?: string;
};

const SysprepFileField: React.FC<SysprepFileFieldProps> = ({ id, onChange, value }) => {
  const { t } = useKubevirtTranslation();
  const [data, setData] = React.useState<SysprepFile>({
    fileName: '',
    isLoading: false,
    validated: ValidatedOptions.default,
    value,
  });

  const onFieldChange = (newValue: string, fileName: string) => {
    setData((currentSysprepFile) => ({
      ...currentSysprepFile,
      fileName,
      validated:
        XMLValidator.validate(newValue) === true
          ? ValidatedOptions.default
          : ValidatedOptions.error,
      value: newValue,
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
        onReadFinished={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: false }))
        }
        onReadStarted={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: true }))
        }
        validated={
          data.validated !== ValidatedOptions.error
            ? ValidatedOptions.default
            : ValidatedOptions.error
        }
        allowEditingUploadedText
        data-test={`sysprep-${id.toLowerCase().replace('.', '-')}-input`}
        filename={data.fileName}
        id={`sysprep-${id}-input`}
        isLoading={data.isLoading}
        isReadOnly={false}
        onChange={onFieldChange}
        type="text"
        value={data.value}
      />
      {data.validated === ValidatedOptions.error && (
        <Text className="kv-sysprep--error" component={TextVariants.p}>
          {t('XML structure is not valid')}
        </Text>
      )}
    </>
  );
};

export default SysprepFileField;
