import React, { FC } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';

import { modalsBySource } from './utils/constants';
import { getSourceFromVolume } from './utils/helpers';
import { V1DiskModalProps } from './utils/types';

const DiskModal: FC<V1DiskModalProps> = ({
  createDiskSource,
  editDiskName,
  isCreated,
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const diskVolume = getVolumes(vm)?.find((volume) => volume.name === editDiskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === diskVolume?.dataVolume?.name,
  );

  const editDiskSource = getSourceFromVolume(diskVolume, dataVolumeTemplate);

  const Modal = modalsBySource[createDiskSource || editDiskSource];

  return (
    <Modal
      createDiskSource={createDiskSource}
      editDiskName={editDiskName}
      isCreated={isCreated}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      onUploadedDataVolume={onUploadedDataVolume}
      vm={vm}
    />
  );
};

export default DiskModal;
