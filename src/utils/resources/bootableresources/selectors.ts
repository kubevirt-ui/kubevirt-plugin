import {
  V1beta1DataSource,
  V1beta1DataVolumeSourcePVC,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';

export const getDataSourcePVCSource = (dataSource: V1beta1DataSource): V1beta1DataVolumeSourcePVC =>
  dataSource?.spec?.source?.pvc;
