import { DataVolumeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { useK8sWatchResources, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { printableVMStatus } from '@virtualmachines/utils';

import { NameWithPercentages } from './types';

type UseProvisioningPercentageType = (vmi: V1VirtualMachine) => {
  loaded: boolean;
  percentages: NameWithPercentages;
};

const useProvisioningPercentage: UseProvisioningPercentageType = (vm) => {
  const volumes = getVolumes(vm);
  const namespace = getNamespace(vm);

  const dataVolumeNames =
    volumes?.filter((v) => v.dataVolume).map((dvVolume) => dvVolume.dataVolume?.name) || [];

  const watchRequest = dataVolumeNames.reduce((acc, current) => {
    acc[current] = {
      groupVersionKind: DataVolumeModelGroupVersionKind,
      name: current,
      namespace: namespace,
    };
    return acc;
  }, {} as { [key in string]: WatchK8sResource });

  const vmPrintableStatus = getVMStatus(vm);

  const dataVolumeWatch = useK8sWatchResources<{
    [key in string]: V1beta1DataVolume;
  }>(vmPrintableStatus === printableVMStatus.Provisioning ? watchRequest : {});

  const loaded = Object.values(dataVolumeWatch || {}).every(
    (watchResource) => watchResource.loaded || watchResource.loadError,
  );

  const percentages = Object.keys(dataVolumeWatch || {}).reduce((acc, dataVolumeName) => {
    acc[dataVolumeName] = dataVolumeWatch[dataVolumeName]?.data?.status?.progress;

    return acc;
  }, {} as NameWithPercentages);

  return { loaded, percentages };
};

export default useProvisioningPercentage;
