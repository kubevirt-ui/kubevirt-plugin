import type { UseFormSetValue } from 'react-hook-form';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { TLS_CERT_SOURCE_EXISTING } from '@kubevirt-utils/components/TLSCertificateSection';

import type { BootableVolumeWizardFormValues } from '../../../form/types';
import { wizardSetValueOptions } from '../../../form/wizardSetValueOptions';

type ResetImageSourceFieldsArgs = {
  previousSourceType: DROPDOWN_FORM_SELECTION;
  setValue: UseFormSetValue<BootableVolumeWizardFormValues>;
};

export const resetImageSourceFieldsOnSourceChange = ({
  previousSourceType,
  setValue,
}: ResetImageSourceFieldsArgs): void => {
  setValue('imageSource.upload', { filename: '' }, wizardSetValueOptions);
  setValue('imageSource.isIso', false, wizardSetValueOptions);
  setValue(
    'imageSource.existingVolume',
    { clone: true, name: '', project: '' },
    wizardSetValueOptions,
  );
  setValue('imageSource.existingSnapshot', { name: '', project: '' }, wizardSetValueOptions);
  setValue(
    'imageSource.registry',
    {
      cronExpression: '',
      image: '',
      password: '',
      retainRevisions: 3,
      username: '',
    },
    wizardSetValueOptions,
  );
  setValue(
    'imageSource.url',
    {
      certificateSource: TLS_CERT_SOURCE_EXISTING,
      imageUrl: '',
      tlsCertificateRequired: false,
    },
    wizardSetValueOptions,
  );

  if (previousSourceType === DROPDOWN_FORM_SELECTION.USE_SNAPSHOT) {
    setValue('imageSource.diskSize', DEFAULT_DISK_SIZE, wizardSetValueOptions);
  }
};
