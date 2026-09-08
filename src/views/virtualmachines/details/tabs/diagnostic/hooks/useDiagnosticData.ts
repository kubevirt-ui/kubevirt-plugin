import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { DataVolumeModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1VirtualMachine,
  type V1VirtualMachineCondition,
  type V1VolumeSnapshotStatus,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { CLOUDINITDISK } from '@kubevirt-utils/constants/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { type FleetWatchK8sResults } from '@stolostron/multicluster-sdk';

import { DiagnosticCategory } from '../utils/constants';
import {
  type DiagnosticData,
  type VirtualizationDataVolumeStatus,
  type VirtualizationStatusCondition,
  type VirtualizationVolumeSnapshotStatus,
} from '../utils/types';
import { getConditionSeverity, getDVSeverity, getSnapshotSeverity } from '../utils/utils';

const getDataVolumesNames = (vm: V1VirtualMachine): string[] =>
  vm?.spec?.template?.spec?.volumes
    ?.filter((volume) => volume?.dataVolume?.name)
    ?.map((volume) => volume.dataVolume.name) ?? [];

const buildDataVolumeResources = (vm: V1VirtualMachine): Record<string, unknown> =>
  Object.fromEntries(
    getDataVolumesNames(vm)?.map((name) => [
      name,
      {
        cluster: getCluster(vm),
        groupVersionKind: DataVolumeModelGroupVersionKind,
        name,
        namespace: vm?.metadata?.namespace,
      },
    ]) || [],
  );

const volumeSnapshotStatusesTransformer = (
  volumeSnapshotStatuses: V1VolumeSnapshotStatus[] = [],
): VirtualizationVolumeSnapshotStatus[] =>
  volumeSnapshotStatuses.map((vss) => {
    const index = vss?.reason?.indexOf(':') ?? -1;
    const hasColon = index !== -1;

    const reason = hasColon ? vss.reason.slice(0, index) : vss?.name;
    const message = hasColon ? vss.reason.slice(index + 1) : vss?.reason;

    return {
      ...vss,
      id: uuidv4(),
      message,
      metadata: {
        condition: 'Other',
        name: hasColon ? vss.reason.slice(0, index) : (vss?.reason ?? vss?.name),
        type: DiagnosticCategory.Storage,
      },
      reason,
      severity: vss?.name === CLOUDINITDISK ? 'healthy' : getSnapshotSeverity(vss?.enabled),
      status: vss?.enabled,
    };
  });

const conditionsTransformer = (
  conditions: V1VirtualMachineCondition[] = [],
): VirtualizationStatusCondition[] =>
  conditions.map((condition) => ({
    ...condition,
    id: uuidv4() as string,
    lastTransitionTime: condition?.['lastTransitionTime'],
    metadata: {
      condition: condition?.status === 'False' ? 'Error' : 'Other',
      name: condition?.reason ?? condition?.type,
      type: DiagnosticCategory.VirtualMachines,
    },
    severity: getConditionSeverity(condition?.status, condition?.type),
  }));

const buildDVStatus = (
  data: FleetWatchK8sResults<{ [name: string]: V1beta1DataVolume }>,
): VirtualizationDataVolumeStatus[] =>
  Object.values(data)
    .filter((dataVolume) => dataVolume.loaded && dataVolume.data)
    .map((dataVolume) => {
      const element = dataVolume.data;
      const conditions = element?.status?.conditions;
      const message = conditions?.[conditions.length - 1]?.message;
      const phase = element?.status?.phase;

      return {
        id: element?.metadata?.uid,
        message,
        name: element?.metadata?.name,
        phase,
        progress: element?.status?.progress,
        severity: getDVSeverity(phase),
      };
    });

const useDiagnosticData = (vm: V1VirtualMachine): DiagnosticData => {
  const dvResources = useMemo(() => buildDataVolumeResources(vm), [vm]);
  const dataVolumesData = useKubevirtWatchResources<{ [name: string]: V1beta1DataVolume }>(
    dvResources,
  );

  return useMemo(() => {
    const volumeSnapshotStatuses = volumeSnapshotStatusesTransformer(
      vm?.status?.volumeSnapshotStatuses,
    );
    const conditions = conditionsTransformer(vm?.status?.conditions);
    const dataVolumesStatuses = buildDVStatus(dataVolumesData);

    return { conditions, dataVolumesStatuses, volumeSnapshotStatuses };
  }, [dataVolumesData, vm?.status?.conditions, vm?.status?.volumeSnapshotStatuses]);
};

export default useDiagnosticData;
