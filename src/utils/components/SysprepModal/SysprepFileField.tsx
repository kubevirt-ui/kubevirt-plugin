import React, { type ChangeEvent, type FC, useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Content,
  ContentVariants,
  type DropEvent,
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

const isValidXML = (xmlString: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  return doc.querySelector('parsererror') === null;
};

const SysprepFileField: FC<SysprepFileFieldProps> = ({ id, onChange, value }) => {
  const { t } = useKubevirtTranslation();
  const [data, setData] = useState<SysprepFile>({
    fileName: '',
    isLoading: false,
    validated: ValidatedOptions.default,
    value,
  });

  const onFieldChange = (newValue: string): void => {
    setData((currentSysprepFile) => ({
      ...currentSysprepFile,
      validated: isValidXML(newValue) ? ValidatedOptions.default : ValidatedOptions.error,
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
        onFileInputChange={(_event: DropEvent, file: File) => {
          setData((currentData: SysprepFile) => ({ ...currentData, fileName: file.name }));
        }}
        onReadFinished={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: false }))
        }
        onReadStarted={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: true }))
        }
        onTextChange={(_event: ChangeEvent<HTMLTextAreaElement>, text: string) =>
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
        onDataChange={(_event: DropEvent, text: string) => onFieldChange(text)}
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
