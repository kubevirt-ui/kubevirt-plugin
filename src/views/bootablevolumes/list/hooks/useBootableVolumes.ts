import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import {
  Operator,
  useK8sWatchResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

const useBootableVolumes = (): WatchK8sResult<V1beta1DataSource[]> =>
  useK8sWatchResource<V1beta1DataSource[]>({
    groupVersionKind: DataSourceModelGroupVersionKind,
    namespace: OPENSHIFT_OS_IMAGES_NS,
    isList: true,
    selector: {
      matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
    },
  });

export default useBootableVolumes;
