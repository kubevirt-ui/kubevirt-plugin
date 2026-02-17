import { useMemo } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  TLS_CERT_SOURCE_EXISTING,
} from '../utils/constants';

type UseAddBootableVolumeFormValidationParams = {
  bootableVolume: AddBootableVolumeState;
  sourceType: DROPDOWN_FORM_SELECTION;
};

export const useAddBootableVolumeFormValidation = ({
  bootableVolume,
  sourceType,
}: UseAddBootableVolumeFormValidationParams): boolean => {
  const isRegistryFormValid = useMemo(() => {
    if (sourceType !== DROPDOWN_FORM_SELECTION.USE_REGISTRY) return true;

    const { registryCredentials, registryURL } = bootableVolume;
    const { password, username } = registryCredentials || {};

    const areCredentialsEmpty = isEmpty(username) && isEmpty(password);
    const areCredentialsFilled = !isEmpty(username) && !isEmpty(password);
    const areCredentialsValid = areCredentialsFilled || areCredentialsEmpty;

    return !!(registryURL && areCredentialsValid);
  }, [sourceType, bootableVolume]);

  const isTlsCertValid = useMemo(() => {
    if (sourceType !== DROPDOWN_FORM_SELECTION.USE_HTTP) return true;
    if (!bootableVolume?.tlsCertificateRequired) return true;

    const useExisting = bootableVolume?.tlsCertSource === TLS_CERT_SOURCE_EXISTING;
    if (useExisting) {
      return !!bootableVolume?.tlsCertConfigMapName?.trim();
    }
    return !!bootableVolume?.tlsCertificate?.trim();
  }, [sourceType, bootableVolume]);

  const isFormValid = useMemo(() => {
    const hasRequiredPreference = !!bootableVolume?.labels?.[DEFAULT_PREFERENCE_LABEL];
    return hasRequiredPreference && isRegistryFormValid && isTlsCertValid;
  }, [bootableVolume?.labels, isRegistryFormValid, isTlsCertValid]);

  return isFormValid;
};
