import React, { Dispatch, FC, SetStateAction } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Checkbox, StackItem } from '@patternfly/react-core';

import { sameVolume } from '../utils/helpers';

type DeleteVolumeCheckboxProps = {
  resource: IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume;

  setVolumesToSave: Dispatch<
    SetStateAction<(IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[]>
  >;
  volumesToSave: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[];
};

const DeleteVolumeCheckbox: FC<DeleteVolumeCheckboxProps> = ({
  resource,
  setVolumesToSave,
  volumesToSave,
}) => {
  const { t } = useKubevirtTranslation();
  const resourceName = getName(resource);

  const saveVolume = () => setVolumesToSave((prevVolumes) => [...prevVolumes, resource]);

  const deleteVolume = () =>
    setVolumesToSave((prevVolumes) =>
      prevVolumes.filter((volume) => !sameVolume(volume, resource)),
    );

  return (
    <StackItem>
      <Checkbox
        label={t('Delete disk {{resourceName}} ({{kindAbbr}})', {
          kindAbbr:
            resource.kind === PersistentVolumeClaimModel.kind
              ? PersistentVolumeClaimModel.abbr
              : DataVolumeModel.abbr,
          resourceName,
        })}
        id={`${resource.kind}-${resourceName}`}
        isChecked={!volumesToSave.find((volume) => sameVolume(volume, resource))}
        onChange={(_, checked: boolean) => (checked ? deleteVolume() : saveVolume())}
      />
    </StackItem>
  );
};

export default DeleteVolumeCheckbox;
