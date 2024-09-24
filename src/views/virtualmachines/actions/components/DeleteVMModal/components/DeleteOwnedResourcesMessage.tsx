import React, { Dispatch, FC, SetStateAction } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1beta1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, StackItem } from '@patternfly/react-core';

import { findPVCOwner } from '../utils/helpers';

import DeleteResourceCheckbox from './DeleteResourceCheckbox';

type DeleteOwnedResourcesMessageProps = {
  dataVolumes: V1beta1DataVolume[];
  loaded: boolean;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSnapshotsToSave: Dispatch<SetStateAction<V1beta1VirtualMachineSnapshot[]>>;
  setVolumesToSave: Dispatch<
    SetStateAction<(IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[]>
  >;
  snapshots: V1beta1VirtualMachineSnapshot[];
  snapshotsToSave: V1beta1VirtualMachineSnapshot[];
  volumesToSave: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[];
};

const DeleteOwnedResourcesMessage: FC<DeleteOwnedResourcesMessageProps> = ({
  dataVolumes,
  loaded,
  pvcs,
  setSnapshotsToSave,
  setVolumesToSave,
  snapshots,
  snapshotsToSave,
  volumesToSave,
}) => {
  const { t } = useKubevirtTranslation();

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const pvcsWithNoDataVolumes = pvcs?.filter((pvc) => !findPVCOwner(pvc, dataVolumes)) || [];

  const diskCount = dataVolumes?.length + pvcsWithNoDataVolumes?.length || 0;

  return (
    <>
      {!!diskCount && (
        <StackItem>
          {t(
            'The following resources will be deleted along with this VirtualMachine. Unchecked items will not be deleted.',
          )}
        </StackItem>
      )}

      {[...(dataVolumes || []), ...pvcsWithNoDataVolumes].map((resource) => (
        <DeleteResourceCheckbox
          key={`${resource.kind}-${getName(resource)}`}
          resource={resource}
          resourcesToSave={volumesToSave}
          setResourcesToSave={setVolumesToSave}
        />
      ))}

      {!isEmpty(snapshots) &&
        snapshots.map((snapshot) => (
          <DeleteResourceCheckbox
            key={`${snapshot.kind}-${getName(snapshot)}`}
            resource={snapshot}
            resourcesToSave={snapshotsToSave}
            setResourcesToSave={setSnapshotsToSave}
          />
        ))}
    </>
  );
};

export default DeleteOwnedResourcesMessage;
