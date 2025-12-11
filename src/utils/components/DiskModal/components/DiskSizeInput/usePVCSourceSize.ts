import {
  V1beta1DataSource,
  V1beta1DataVolumeSourceRef,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-utils/models';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const usePVCSourceSize = (
  dataSourceRef: V1beta1DataVolumeSourceRef,
  pvcClaimName: string,
  pvcClaimNamespace: string,
): [pvcSize: string, loaded: boolean, error: any] => {
  const [dataSource, dsLoaded, dsError] = useK8sWatchResource<V1beta1DataSource>(
    dataSourceRef
      ? {
          groupVersionKind: DataSourceModelGroupVersionKind,
          name: dataSourceRef?.name,
          namespace: dataSourceRef?.namespace,
        }
      : null,
  );

  const pvcWatchResource = pvcClaimName
    ? {
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        name: pvcClaimName,
        namespace: pvcClaimNamespace,
      }
    : null;
  const dataSourcePVCWatchRequest = dataSource?.spec?.source?.pvc?.name
    ? {
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        name: dataSource.spec.source.pvc.name,
        namespace: dataSource.spec.source.pvc.namespace,
      }
    : null;

  const [pvc, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim>(
    pvcWatchResource || dataSourcePVCWatchRequest,
  );

  return [getPVCSize(pvc), loaded && dsLoaded, error || dsError];
};

export default usePVCSourceSize;
