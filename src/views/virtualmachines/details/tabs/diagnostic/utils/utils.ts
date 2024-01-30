import { v4 as uuidv4 } from 'uuid';

import { DataVolumeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1VirtualMachine,
  V1VirtualMachineCondition,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';

import {
  VirtualizationDataVolumeStatus,
  VirtualizationStatusCondition,
  VirtualizationVolumeSnapshotStatus,
} from './types';

export const volumeSnapshotStatusesTransformer = (
  volumeSnapshotStatuses: V1VolumeSnapshotStatus[] = [],
): VirtualizationVolumeSnapshotStatus[] => {
  return volumeSnapshotStatuses.map((vss) => {
    const copyVSS: VirtualizationVolumeSnapshotStatus = {
      ...vss,
      metadata: { condition: 'Other', type: 'Storage' },
    };
    copyVSS.status = vss?.enabled;
    const index = vss?.reason?.indexOf(':');
    copyVSS.metadata.name = vss?.reason || vss?.name;
    if (index !== -1) {
      copyVSS.reason = vss?.reason?.slice(0, index);
      copyVSS.message = vss?.reason?.slice(index + 1, vss?.reason?.length);
      copyVSS.metadata.name = vss?.reason?.slice(0, index);
    }

    if (!copyVSS?.message) {
      copyVSS.message = copyVSS.reason;
      copyVSS.reason = copyVSS.name;
    }
    copyVSS.id = uuidv4();
    return { ...copyVSS };
  });
};

export const conditionsTransformer = (
  conditions: V1VirtualMachineCondition[] = [],
): VirtualizationStatusCondition[] => {
  return conditions?.map((condition) => {
    const id = uuidv4();
    const copyConditions: VirtualizationStatusCondition = {
      ...condition,
      id,
      metadata: {
        condition: condition?.status === 'False' ? 'Error' : 'Other',
        name: condition?.reason || condition?.type,
        type: 'VirtualMachines',
      },
    };
    return copyConditions;
  });
};

export const buildDVStatus = (
  data: WatchK8sResults<{ [name: string]: V1beta1DataVolume }>,
): VirtualizationDataVolumeStatus[] => {
  const elements = Object.values(data).map((dv) => dv.data);
  return elements.map((element) => {
    const conditions = element?.status?.conditions;
    const message = conditions?.[conditions.length - 1]?.message;

    return {
      id: element?.metadata?.uid,
      message,
      name: element?.metadata?.name,
      phase: element?.status?.phase,
      progress: element?.status?.progress,
    };
  });
};

const getDataVolumesNames = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.volumes
    .filter((volume) => volume?.dataVolume)
    .map((volume) => volume?.dataVolume?.name);

export const buildDataVolumeResources = (vm: V1VirtualMachine) =>
  Object.fromEntries(
    getDataVolumesNames(vm)?.map((name) => [
      name,
      {
        groupVersionKind: DataVolumeModelGroupVersionKind,
        name,
        namespace: vm?.metadata?.namespace,
      },
    ]) || [],
  );

export const createURLDiagnostic = (str: string, append: string): string => {
  const urlSpitted = str.split('/');
  if (
    urlSpitted[urlSpitted.length - 1] === VirtualMachineDetailsTab.Logs ||
    urlSpitted[urlSpitted.length - 1] === VirtualMachineDetailsTab.Tables
  ) {
    urlSpitted.pop();
    urlSpitted.push(append);
    return urlSpitted.join('/');
  }
  return str.concat('/' + append);
};
