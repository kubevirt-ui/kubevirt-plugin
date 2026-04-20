import React, { FCC } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1beta1VirtualMachineSnapshot, V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, StackItem } from '@patternfly/react-core';

import { isResourceShared } from '../utils/helpers';

import DeleteResourceCheckbox from './DeleteResourceCheckbox';

type DeleteOwnedResourcesMessageProps = {
  loaded: boolean;
  onToggle: (resource: K8sResourceCommon) => void;
  shareableVolumes: V1Volume[];
  shouldSaveResource: (resource: K8sResourceCommon) => boolean;
  snapshots: V1beta1VirtualMachineSnapshot[];
  volumes: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[];
};

const DeleteOwnedResourcesMessage: FCC<DeleteOwnedResourcesMessageProps> = ({
  loaded,
  onToggle,
  shareableVolumes,
  shouldSaveResource,
  snapshots,
  volumes,
}) => {
  const { t } = useKubevirtTranslation();

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const hasResources = !isEmpty(volumes) || !isEmpty(snapshots);

  if (!hasResources) {
    return <StackItem>{t('No additional resources to delete.')}</StackItem>;
  }

  return (
    <>
      <StackItem>
        {t(
          'Select the resources you want to permanently delete. Unselected items will not be deleted.',
        )}
      </StackItem>

      {volumes.map((resource) => (
        <DeleteResourceCheckbox
          isShareable={isResourceShared(shareableVolumes, resource)}
          key={`${resource.kind}-${getName(resource)}`}
          onToggle={() => onToggle(resource)}
          resource={resource}
          willDelete={!shouldSaveResource(resource)}
        />
      ))}

      {snapshots.map((snapshot) => (
        <DeleteResourceCheckbox
          key={`${snapshot.kind}-${getName(snapshot)}`}
          onToggle={() => onToggle(snapshot)}
          resource={snapshot}
          willDelete={!shouldSaveResource(snapshot)}
        />
      ))}
    </>
  );
};

export default DeleteOwnedResourcesMessage;
