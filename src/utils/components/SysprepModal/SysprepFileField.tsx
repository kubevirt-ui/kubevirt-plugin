import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { XMLValidator } from 'fast-xml-parser';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Content,
  ContentVariants,
  DropEvent,
  FileUpload,
  ValidatedOptions,
} from '@patternfly/react-core';

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

const SysprepFileField: FC<SysprepFileFieldProps> = ({ id, onChange, value }) => {
  const { t } = useKubevirtTranslation();
  const [data, setData] = useState<SysprepFile>({
    fileName: '',
    isLoading: false,
    validated: ValidatedOptions.default,
    value,
  });

  const onFieldChange = (newValue: string) => {
    setData((currentSysprepFile) => ({
      ...currentSysprepFile,
      validated:
        XMLValidator.validate(newValue) === true
          ? ValidatedOptions.default
          : ValidatedOptions.error,
      value: newValue,
    }));
  };

  useEffect(() => {
    if (data.validated) {
      onChange(data.value);
    }
  }, [data.validated, data.value, onChange]);

  return (
    <>
      <FileUpload
        onFileInputChange={(event: DropEvent, file: File) => {
          setData((currentData: SysprepFile) => ({ ...currentData, fileName: file.name }));
        }}
        onReadFinished={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: false }))
        }
        onReadStarted={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: true }))
        }
        onTextChange={(event: ChangeEvent<HTMLTextAreaElement>, text: string) =>
          onFieldChange(text)
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
        onDataChange={(event: DropEvent, text: string) => onFieldChange(text)}
        type="text"
        value={data.value}
      />
      {data.validated === ValidatedOptions.error && (
        <Content className="kv-sysprep--error" component={ContentVariants.p}>
          {t('XML structure is not valid')}
        </Content>
      )}
    </>
  );
};

export default SysprepFileField;
