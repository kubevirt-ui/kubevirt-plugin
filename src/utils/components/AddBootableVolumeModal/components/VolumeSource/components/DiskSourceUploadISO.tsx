import { type FC } from 'react';

import {
  type AddBootableVolumeState,
  type SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox } from '@patternfly/react-core';

type DiskSourceUploadISOProps = {
  bootableVolume: AddBootableVolumeState;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const DiskSourceUploadISO: FC<DiskSourceUploadISOProps> = ({
  bootableVolume,
  isDisabled,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Checkbox
      id="iso-checkbox"
      isChecked={bootableVolume.isIso ?? false}
      isDisabled={isDisabled}
      label={t('This is an ISO file')}
      onChange={(_event, value: boolean) => setBootableVolumeField('isIso')(value)}
    />
  );
};

export default DiskSourceUploadISO;
