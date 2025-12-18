import {
  V1beta1DataSource,
  V1beta1DataVolumeSourceRef,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-utils/models';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const usePVCSourceSize = (
  dataSourceRef: V1beta1DataVolumeSourceRef,
  pvcClaimName: string,
  pvcClaimNamespace: string,
): [pvcSize: string, loaded: boolean, error: any] => {
  const cluster = useClusterParam();
  const [dataSource, dsLoaded, dsError] = useK8sWatchData<V1beta1DataSource>(
    dataSourceRef
      ? {
          cluster,
          groupVersionKind: DataSourceModelGroupVersionKind,
          name: dataSourceRef?.name,
          namespace: dataSourceRef?.namespace,
        }
      : null,
  );

  const pvcWatchResource = pvcClaimName
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        name: pvcClaimName,
        namespace: pvcClaimNamespace,
      }
    : null;
  const dataSourcePVCWatchRequest = dataSource?.spec?.source?.pvc?.name
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        name: dataSource.spec.source.pvc.name,
        namespace: dataSource.spec.source.pvc.namespace,
      }
    : null;

  const [pvc, loaded, error] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim>(
    pvcWatchResource || dataSourcePVCWatchRequest,
  );

  return [getPVCSize(pvc), loaded && dsLoaded, error || dsError];
};

export default usePVCSourceSize;
