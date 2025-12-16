import { DataVolumeModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { printableVMStatus } from '@virtualmachines/utils';

import { NameWithPercentages } from './types';

type UseProvisioningPercentageType = (vmi: V1VirtualMachine) => {
  loaded: boolean;
  percentages: NameWithPercentages;
};

const useProvisioningPercentage: UseProvisioningPercentageType = (vm) => {
  const volumes = getVolumes(vm);
  const namespace = getNamespace(vm);
  const vmPrintableStatus = getVMStatus(vm);

  const [dataVolumesInNamespace, loaded] = useK8sWatchData<V1beta1DataVolume[]>(
    vmPrintableStatus === printableVMStatus.Provisioning
      ? {
          cluster: getCluster(vm),
          groupVersionKind: DataVolumeModelGroupVersionKind,
          isList: true,
          namespace: namespace,
        }
      : null,
  );

  const dataVolumeNames =
    volumes?.filter((v) => v.dataVolume)?.map((dvVolume) => dvVolume.dataVolume?.name) || [];

  const dataVolumes =
    dataVolumesInNamespace?.filter((dv) => dataVolumeNames.includes(getName(dv))) || [];

  const percentages = dataVolumes.reduce((acc, dataVolume) => {
    acc[getName(dataVolume)] = dataVolume?.status?.progress;

    return acc;
  }, {} as NameWithPercentages);

  return { loaded, percentages };
};

export default useProvisioningPercentage;
