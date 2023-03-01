import {
  DEFAULT_PREFERENCE_LABEL,
  PREFERENCE_DISPLAY_NAME_KEY,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';

export const getOSFromDefaultPreference = (bootSource: V1beta1DataSource, preferencesMap) => {
  const defaultPreferenceName = getLabel(bootSource, DEFAULT_PREFERENCE_LABEL);

  const defaultPreference = preferencesMap?.[defaultPreferenceName];

  const defaultPreferenceDisplayName = getAnnotation(
    defaultPreference,
    PREFERENCE_DISPLAY_NAME_KEY,
  );
  return defaultPreferenceDisplayName || defaultPreferenceName;
};
