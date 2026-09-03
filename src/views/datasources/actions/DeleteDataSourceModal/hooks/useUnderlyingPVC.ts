import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { getDataSourcePVCSource } from '@kubevirt-utils/resources/bootableresources/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

type UseUnderlyingPVC = (dataSource: V1beta1DataSource) => {
  dataVolume: V1beta1DataVolume;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  sourceExists: boolean;
};

const useUnderlyingPVC: UseUnderlyingPVC = (dataSource) => {
  const dataSourcePVC = getDataSourcePVCSource(dataSource);
  const { name, namespace } = dataSourcePVC || {};

  const [pvc] = useKubevirtWatchResource<IoK8sApiCoreV1PersistentVolumeClaim>(
    dataSourcePVC && {
      cluster: getCluster(dataSource),
      groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
      name,
      namespace,
    },
  );

  const [dataVolume] = useKubevirtWatchResource<V1beta1DataVolume>(
    dataSourcePVC && {
      cluster: getCluster(dataSource),
      groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
      name,
      namespace,
    },
  );

  const sourceExists = !isEmpty(pvc) || !isEmpty(dataVolume);
  return { dataVolume, pvc, sourceExists };
};

export default useUnderlyingPVC;
