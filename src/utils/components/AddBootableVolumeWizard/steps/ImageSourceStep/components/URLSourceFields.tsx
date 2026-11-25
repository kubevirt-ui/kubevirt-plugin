import type { FC } from 'react';
import { useController, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import {
  TLSCertificateSection,
  type TLSCertSourceType,
} from '@kubevirt-utils/components/TLSCertificateSection';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getIsoDetectionPath } from '@kubevirt-utils/resources/bootableresources/isoHelpers';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import { wizardSetValueOptions } from '../../../form/wizardSetValueOptions';
import { setImageSourceIsoFromPath } from '../utils/setImageSourceDiskSize';

const EXAMPLE_IMAGE_URL =
  'https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2';

const URLSourceFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, control, setValue } = useBootableVolumeWizardForm();

  const {
    field: imageUrlField,
    fieldState: { error: imageUrlError },
  } = useController({ control, name: 'imageSource.url.imageUrl' });
  const { message, validated } = getFieldValidationState(imageUrlError);

  const [
    destinationProject,
    tlsCertificateRequired,
    certificateSource,
    certificate,
    configMapName,
    tlsProject,
  ] = useWatch({
    control,
    name: [
      'projectAndVolume.destinationProject',
      'imageSource.url.tlsCertificateRequired',
      'imageSource.url.certificateSource',
      'imageSource.url.certificate',
      'imageSource.url.configMapName',
      'imageSource.url.project',
    ],
  });

  const onExistingCertificateChange = (certNamespace: string, certConfigMapName: string): void => {
    setValue('imageSource.url.project', certNamespace, wizardSetValueOptions);
    setValue('imageSource.url.configMapName', certConfigMapName, wizardSetValueOptions);
    setValue('imageSource.url.certificate', undefined, wizardSetValueOptions);
  };

  const onNewCertificateChange = (newCertificate: string): void => {
    setValue('imageSource.url.certificate', newCertificate, wizardSetValueOptions);
    setValue('imageSource.url.project', undefined, wizardSetValueOptions);
    setValue('imageSource.url.configMapName', undefined, wizardSetValueOptions);
  };

  const onRequiredChange = (required: boolean): void => {
    setValue('imageSource.url.tlsCertificateRequired', required, wizardSetValueOptions);
  };

  const onSourceChange = (source: TLSCertSourceType): void => {
    setValue('imageSource.url.certificateSource', source, wizardSetValueOptions);
  };

  const onImageUrlChange = (url: string): void => {
    const previousPath = getIsoDetectionPath(imageUrlField.value);
    const nextPath = getIsoDetectionPath(url);
    imageUrlField.onChange(url);
    if (previousPath !== nextPath) {
      setImageSourceIsoFromPath(setValue, url);
    }
  };

  return (
    <>
      <FormGroup fieldId="image-url" isRequired label={t('Image URL')}>
        <TextInput
          id="image-url"
          {...imageUrlField}
          onChange={(_event, value) => onImageUrlChange(value)}
          type="text"
          validated={validated}
          value={imageUrlField.value ?? ''}
        />
        <FormGroupHelperText validated={validated}>
          {message ?? (
            <>
              {t('Enter URL to download. For example:')}{' '}
              <a href={EXAMPLE_IMAGE_URL} rel="noreferrer" target="_blank">
                {EXAMPLE_IMAGE_URL}
              </a>
            </>
          )}
        </FormGroupHelperText>
      </FormGroup>

      <TLSCertificateSection
        cluster={cluster}
        namespace={destinationProject}
        onExistingCertificateChange={onExistingCertificateChange}
        onNewCertificateChange={onNewCertificateChange}
        onRequiredChange={onRequiredChange}
        onSourceChange={onSourceChange}
        tlsCertConfigMapName={configMapName}
        tlsCertificate={certificate}
        tlsCertificateRequired={tlsCertificateRequired}
        tlsCertProject={tlsProject}
        tlsCertSource={certificateSource as TLSCertSourceType | undefined}
      />
    </>
  );
};

export default URLSourceFields;
