import { type FC } from 'react';

import {
  type AddBootableVolumeState,
  type SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import ThisIsAnIsoFileCheckbox from '@kubevirt-utils/components/ThisIsAnIsoFileCheckbox/ThisIsAnIsoFileCheckbox';

type DiskSourceUploadISOProps = {
  bootableVolume: AddBootableVolumeState;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const DiskSourceUploadISO: FC<DiskSourceUploadISOProps> = ({
  bootableVolume,
  isDisabled,
  setBootableVolumeField,
}) => (
  <ThisIsAnIsoFileCheckbox
    id="iso-checkbox"
    isChecked={bootableVolume.isIso ?? false}
    isDisabled={isDisabled}
    onChange={(value) => setBootableVolumeField('isIso')(value)}
  />
);

export default DiskSourceUploadISO;
