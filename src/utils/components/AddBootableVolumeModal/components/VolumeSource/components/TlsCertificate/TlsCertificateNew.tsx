import React, { FC, useState } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload } from '@patternfly/react-core';

type TlsCertificateNewProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const TlsCertificateNew: FC<TlsCertificateNewProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [isCertLoading, setIsCertLoading] = useState(false);

  return (
    <>
      <FileUpload
        onDataChange={(_event: DropEvent, data: string) =>
          setBootableVolumeField('tlsCertificate')(data)
        }
        onFileInputChange={async (_, file: File) => {
          setIsCertLoading(true);
          try {
            const text = await file.text();
            setBootableVolumeField('tlsCertificate')(text);
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
        onClearClick={() => setBootableVolumeField('tlsCertificate')('')}
        onTextChange={(_event, value: string) => setBootableVolumeField('tlsCertificate')(value)}
        type="text"
        value={bootableVolume?.tlsCertificate || ''}
      />
      <FormGroupHelperText>
        {t('PEM-encoded CA certificate for HTTPS sources with a custom or self-signed CA.')}
      </FormGroupHelperText>
    </>
  );
};

export default TlsCertificateNew;
