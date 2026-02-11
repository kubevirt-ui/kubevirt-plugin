import React, { FC } from 'react';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import usePVCDiskSource from './hooks/usePVCDiskSource';
import { getDiskModalBySource } from './utils/getDiskModalBySource';
import { getSourceFromVolume } from './utils/helpers';
import { V1DiskModalProps } from './utils/types';

const DiskModal: FC<V1DiskModalProps> = ({
  createDiskSource,
  createdPVCName,
  defaultFormValues,
  editDiskName,
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  onUploadStarted,
  vm,
}) => {
  const diskVolume = getVolumes(vm)?.find((volume) => volume.name === editDiskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === diskVolume?.dataVolume?.name,
  );

  const namespace = getNamespace(vm);
  const [pvc] = usePVCDiskSource(createdPVCName, namespace);

  const editDiskSource = getSourceFromVolume(diskVolume, dataVolumeTemplate);

  const Modal = getDiskModalBySource[createDiskSource || editDiskSource];

  return (
    <Modal
      createDiskSource={createDiskSource}
      defaultFormValues={defaultFormValues}
      editDiskName={editDiskName}
      isCreated={!isEmpty(createdPVCName)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      onUploadedDataVolume={onUploadedDataVolume}
      onUploadStarted={onUploadStarted}
      pvc={pvc}
      vm={vm}
    />
  );
};

export default DiskModal;
