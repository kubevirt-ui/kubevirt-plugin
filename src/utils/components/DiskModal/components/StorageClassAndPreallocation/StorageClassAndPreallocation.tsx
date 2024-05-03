import React, { FC, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { requiresDataVolume } from '../../utils/helpers';
import { DiskFormState, SourceTypes } from '../../utils/types';
import ApplyStorageProfileSettings from '../StorageProfileSettings/ApplyStorageProfileSettings';
import { diskSourceField } from '../utils/constants';

import DefaultStorageClassAlert from './DefaultStorageClassAlert';
import EnablePreallocationCheckbox from './EnablePreallocationCheckbox';
import StorageClassSelect from './StorageClassSelect';

type StorageClassAndPreallocationProps = {
  checkSC?: (selectedStorageClass: string) => boolean;
  isEditingCreatedDisk?: boolean;
};

const StorageClassAndPreallocation: FC<StorageClassAndPreallocationProps> = ({
  checkSC,
  isEditingCreatedDisk,
}) => {
  const [showSCAlert, setShowSCAlert] = useState(false);
  const { watch } = useFormContext<DiskFormState>();

  const diskSource = watch(diskSourceField);

  const sourceRequiresDataVolume = useMemo(() => requiresDataVolume(diskSource), [diskSource]);

  if ((!sourceRequiresDataVolume && diskSource !== SourceTypes.UPLOAD) || isEditingCreatedDisk)
    return null;

  return (
    <>
      <StorageClassSelect checkSC={checkSC} setShowSCAlert={setShowSCAlert} />
      {showSCAlert && <DefaultStorageClassAlert />}
      <ApplyStorageProfileSettings />
      <EnablePreallocationCheckbox isDisabled={!sourceRequiresDataVolume} />
    </>
  );
};

export default StorageClassAndPreallocation;
