import React, { FC, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload } from '@patternfly/react-core';

type NewTLSCertificateProps = {
  onChange: (certificate: string) => void;
  tlsCertificate?: string;
};

const NewTLSCertificate: FC<NewTLSCertificateProps> = ({ onChange, tlsCertificate }) => {
  const { t } = useKubevirtTranslation();
  const [isCertLoading, setIsCertLoading] = useState(false);

  return (
    <>
      <FileUpload
        onFileInputChange={async (_, file: File) => {
          setIsCertLoading(true);
          try {
            const text = await file.text();
            onChange(text);
          } catch {
            onChange('');
          } finally {
            setIsCertLoading(false);
          }
        }}
        allowEditingUploadedText
        aria-label={t('TLS certificate')}
        browseButtonText={t('Upload')}
        filenamePlaceholder={t('Drag and drop a certificate file or paste PEM content')}
        id="tls-certificate-upload"
        isLoading={isCertLoading}
        onClearClick={() => onChange('')}
        onDataChange={(_event: DropEvent, data: string) => onChange(data)}
        onTextChange={(_event, value: string) => onChange(value)}
        type="text"
        value={tlsCertificate || ''}
      />
      <FormGroupHelperText>
        {t('PEM-encoded CA certificate for HTTPS sources with a custom or self-signed CA.')}
      </FormGroupHelperText>
    </>
  );
};

export default NewTLSCertificate;
