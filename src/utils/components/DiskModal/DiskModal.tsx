import React, { type FC } from 'react';

import { type V1DataVolumeTemplateSpec } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import usePVCDiskSource from './hooks/usePVCDiskSource';
import { getDiskModalBySource } from './utils/getDiskModalBySource';
import { getSourceFromVolume } from './utils/helpers';
import { type V1DiskModalProps, type V1SubDiskModalProps } from './utils/types';

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
    (dvTemplate) => getName(dvTemplate) === diskVolume?.dataVolume?.name,
  ) as undefined | V1DataVolumeTemplateSpec;

  const namespace = getNamespace(vm);
  const [pvc] = usePVCDiskSource(createdPVCName, namespace, getCluster(vm));

  const editDiskSource = getSourceFromVolume(diskVolume, dataVolumeTemplate);

  const Modal = getDiskModalBySource[
    createDiskSource ?? editDiskSource
  ] as never as FC<V1SubDiskModalProps>;

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
