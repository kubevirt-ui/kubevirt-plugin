import type { FieldPath } from 'react-hook-form';

import type { BootableVolumeWizardFormValues } from './types';

type WizardFieldPath = FieldPath<BootableVolumeWizardFormValues>;

export const DESTINATION_PROJECT_FIELD =
  'projectAndVolume.destinationProject' satisfies WizardFieldPath;
export const IMAGE_SOURCE_FIELD = 'imageSource' satisfies WizardFieldPath;
export const OPERATING_SYSTEM_FIELD = 'operatingSystem.operatingSystem' satisfies WizardFieldPath;
export const VOLUME_NAME_FIELD = 'projectAndVolume.volumeName' satisfies WizardFieldPath;
