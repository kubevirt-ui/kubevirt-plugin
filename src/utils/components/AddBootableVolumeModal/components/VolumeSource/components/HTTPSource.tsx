import React, { FCC } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
  TLS_CERT_FIELD_NAMES,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { TLSCertificateSection } from '@kubevirt-utils/components/TLSCertificateSection';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useRequiredFieldValidation } from '@kubevirt-utils/hooks/useRequiredFieldValidation';
import { FormGroup } from '@patternfly/react-core';

type HTTPSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const HTTPSource: FCC<HTTPSourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();

  const httpSourceHelperURL =
    'https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2';

  const {
    isInvalid: isUrlInvalid,
    onBlur: onUrlBlur,
    validated: urlValidated,
  } = useRequiredFieldValidation(bootableVolume?.url);

  return (
    <>
      <FormGroup
        className="disk-source-form-group"
        fieldId="image-url"
        isRequired
        label={t('Image URL')}
      >
        <FormTextInput
          id="image-url"
          onBlur={onUrlBlur}
          onChange={(event) => setBootableVolumeField('url')(event.currentTarget.value)}
          type="text"
          validated={urlValidated}
          value={bootableVolume?.url || ''}
        />
        <FormGroupHelperText validated={urlValidated}>
          {isUrlInvalid ? (
            t('This field is required')
          ) : (
            <>
              {t('Enter URL to download. For example:')}{' '}
              <a href={httpSourceHelperURL} rel="noreferrer" target="_blank">
                {httpSourceHelperURL}
              </a>
            </>
          )}
        </FormGroupHelperText>
      </FormGroup>

      <TLSCertificateSection
        onExistingCertificateChange={(certNamespace, configMapName) => {
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertProject)(certNamespace);
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertConfigMapName)(configMapName);
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)(null);
        }}
        onNewCertificateChange={(certificate) => {
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)(certificate);
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertProject)(null);
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertConfigMapName)(null);
        }}
        onRequiredChange={(required) =>
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificateRequired)(required)
        }
        onSourceChange={(source) =>
          setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertSource)(source)
        }
        cluster={bootableVolume?.bootableVolumeCluster}
        namespace={bootableVolume?.bootableVolumeNamespace}
        tlsCertConfigMapName={bootableVolume?.tlsCertConfigMapName}
        tlsCertificate={bootableVolume?.tlsCertificate}
        tlsCertificateRequired={bootableVolume?.tlsCertificateRequired}
        tlsCertProject={bootableVolume?.tlsCertProject}
        tlsCertSource={bootableVolume?.tlsCertSource}
      />
    </>
  );
};

export default HTTPSource;
