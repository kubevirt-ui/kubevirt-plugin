import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_PREFERENCE_LABEL } from '../utils/constants';

type UseBootableVolumes = () => {
  bootableVolumes: V1beta1DataSource[];
  loaded: boolean;
  loadError: any;
};

const useBootableVolumes: UseBootableVolumes = () => {
  const [dataSources, loadedDataSources, loadErrorDataSources] = useK8sWatchResource<
    V1beta1DataSource[]
  >({
    groupVersionKind: DataSourceModelGroupVersionKind,
    isList: true,
    selector: {
      matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
    },
  });

  return {
    bootableVolumes: loadErrorDataSources || isEmpty(dataSources) ? null : dataSources,
    loaded: loadErrorDataSources ? true : loadedDataSources,
    loadError: loadErrorDataSources,
  };
};

export default useBootableVolumes;
