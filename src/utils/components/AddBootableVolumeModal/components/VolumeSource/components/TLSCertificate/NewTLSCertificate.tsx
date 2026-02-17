import React, { FC, useState } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
  TLS_CERT_FIELD_NAMES,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload } from '@patternfly/react-core';

type NewTLSCertificateProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const NewTLSCertificate: FC<NewTLSCertificateProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [isCertLoading, setIsCertLoading] = useState(false);

  return (
    <>
      <FileUpload
        onDataChange={(_event: DropEvent, data: string) =>
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)(data)
        }
        onFileInputChange={async (_, file: File) => {
          setIsCertLoading(true);
          try {
            const text = await file.text();
            setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)(text);
          } catch {
            setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)('');
          } finally {
            setIsCertLoading(false);
          }
        }}
        onTextChange={(_event, value: string) =>
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)(value)
        }
        allowEditingUploadedText
        aria-label={t('TLS certificate')}
        browseButtonText={t('Upload')}
        filenamePlaceholder={t('Drag and drop a certificate file or paste PEM content')}
        id="tls-certificate-upload"
        isLoading={isCertLoading}
        onClearClick={() => setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)('')}
        type="text"
        value={bootableVolume?.[TLS_CERT_FIELD_NAMES.tlsCertificate] || ''}
      />
      <FormGroupHelperText>
        {t('PEM-encoded CA certificate for HTTPS sources with a custom or self-signed CA.')}
      </FormGroupHelperText>
    </>
  );
};

export default NewTLSCertificate;
