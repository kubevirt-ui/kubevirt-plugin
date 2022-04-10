import * as React from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Checkbox, StackItem } from '@patternfly/react-core';

type DeleteOwnedResourcesMessageProps = {
  deleteOwnedResource: boolean;
  setDeleteOwnedResource: React.Dispatch<React.SetStateAction<boolean>>;
  dataVolumes: V1beta1DataVolume[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  snapshots: V1alpha1VirtualMachineSnapshot[];
  loaded: boolean;
};

const DeleteOwnedResourcesMessage: React.FC<DeleteOwnedResourcesMessageProps> = ({
  deleteOwnedResource,
  setDeleteOwnedResource,
  dataVolumes,
  pvcs,
  snapshots,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const diskCount = dataVolumes?.length + pvcs?.length || 0;
  const hasSnapshots = snapshots?.length > 0;

  return (
    <>
      {!!diskCount && (
        <StackItem>
          {t(
            'The following resources will be deleted along with this VirtualMachine. Unchecked items will not be deleted.',
          )}
        </StackItem>
      )}
      {!!diskCount && (
        <StackItem>
          <Checkbox
            id="delete-owned-resources"
            isChecked={deleteOwnedResource}
            onChange={setDeleteOwnedResource}
            label={t('Delete disks ({{diskCount}}x)', { diskCount })}
          />
        </StackItem>
      )}
      {hasSnapshots && (
        <StackItem>
          <strong>{t('Warning')}: </strong>
          {t('All snapshots of this VirtualMachine will be deleted as well.')}
        </StackItem>
      )}
    </>
  );
};

export default DeleteOwnedResourcesMessage;
