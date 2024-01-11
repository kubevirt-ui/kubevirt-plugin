import { useMemo } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import {
  VirtualizationDataVolumeStatus,
  VirtualizationStatusCondition,
  VirtualizationVolumeSnapshotStatus,
} from '../utils/types';
import {
  buildDataVolumeResources,
  buildDVStatus,
  conditionsTransformer,
  volumeSnapshotStatusesTransformer,
} from '../utils/utils';

type UseDiagnosticData = (vm: V1VirtualMachine) => {
  conditions: VirtualizationStatusCondition[];
  dataVolumesStatuses: VirtualizationDataVolumeStatus[];
  volumeSnapshotStatuses: VirtualizationVolumeSnapshotStatus[];
};

const useDiagnosticData: UseDiagnosticData = (vm) => {
  const dataVolumesData = useK8sWatchResources<{ [name: string]: V1beta1DataVolume }>(
    buildDataVolumeResources(vm),
  );

  const data = useMemo(() => {
    const volumeSnapshotStatuses = volumeSnapshotStatusesTransformer(
      vm?.status?.volumeSnapshotStatuses,
    );
    const conditions = conditionsTransformer(vm?.status?.conditions);
    const dataVolumesStatuses = buildDVStatus(dataVolumesData);

    return { conditions, dataVolumesStatuses, volumeSnapshotStatuses };
  }, [dataVolumesData, vm?.status?.conditions, vm?.status?.volumeSnapshotStatuses]);

  return data;
};

export default useDiagnosticData;
