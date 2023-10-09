import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getDataSourcePVCSource } from '@kubevirt-utils/resources/bootableresources/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseUnderlyingPVC = (dataSource: V1beta1DataSource) => {
  dv: V1beta1DataVolume;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  sourceExists: boolean;
};

const useUnderlyingPVC: UseUnderlyingPVC = (dataSource) => {
  const dataSourcePVC = getDataSourcePVCSource(dataSource);
  const { name, namespace } = dataSourcePVC || {};

  const [pvc] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim>(
    dataSourcePVC && {
      groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
      name,
      namespace,
    },
  );

  const [dv] = useK8sWatchResource<V1beta1DataVolume>(
    dataSourcePVC && {
      groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
      name,
      namespace,
    },
  );

  const sourceExists = !isEmpty(pvc) || !isEmpty(dv);
  return { dv, pvc, sourceExists };
};

export default useUnderlyingPVC;
