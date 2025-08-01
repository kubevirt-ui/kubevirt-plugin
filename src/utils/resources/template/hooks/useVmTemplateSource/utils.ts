import produce from 'immer';

import { PersistentVolumeClaimModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1beta1DataVolumeSourceHTTP,
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
  V1beta1DataVolumeSourceRegistry,
  V1beta1DataVolumeSourceSnapshot,
  V1beta1PersistentVolumeClaim,
  V1ContainerDiskSource,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getBootDisk, getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMBootSourceType } from '@kubevirt-utils/resources/vm/utils/source';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { poorManProcess } from '../../utils';
import { BOOT_SOURCE } from '../../utils/constants';
import { getTemplateVirtualMachineObject } from '../../utils/selectors';

export type TemplateBootSource = {
  source: {
    containerDisk?: V1ContainerDiskSource;
    http?: V1beta1DataVolumeSourceHTTP;
    pvc?: V1beta1DataVolumeSourcePVC;
    registry?: V1beta1DataVolumeSourceRegistry;
    snapshot?: V1beta1DataVolumeSourceSnapshot;
    sourceRef?: V1beta1DataVolumeSourceRef;
  };
  sourceValue?: {
    containerDisk?: V1ContainerDiskSource;
    http?: V1beta1DataVolumeSourceHTTP;
    pvc?: V1beta1PersistentVolumeClaim;
    registry?: V1beta1DataVolumeSourceRegistry;
    snapshot?: V1beta1DataVolumeSourceSnapshot;
    sourceRef?: V1beta1PersistentVolumeClaim;
  };
  storageClassName?: string;
  type: BOOT_SOURCE;
};

/**
 * a function to get the boot source from a template and its status
 * @param {V1Template} template - the template to get the boot source from
 * @returns the template's boot source and its status
 */
export const getTemplateBootSourceType = (template: V1Template): TemplateBootSource =>
  getVMBootSourceType(getTemplateVirtualMachineObject(poorManProcess(template)));

/**
 * a function to k8sGet a PVC
 * @param name the name of the PVC
 * @param ns  the namespace of the PVC
 * @param cluster
 * @returns a promise that resolves into the PVC
 */
export const getPVC = (name: string, ns: string, cluster?: string) =>
  kubevirtK8sGet<IoK8sApiCoreV1PersistentVolumeClaim>({
    cluster,
    model: PersistentVolumeClaimModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataVolume
 * @param name the name of the DataVolume
 * @param ns  the namespace of the DataVolume
 * @param cluster
 * @returns a promise that resolves into the DataVolume
 */
export const getDataVolume = (name: string, ns: string, cluster?: string) =>
  kubevirtK8sGet<V1beta1DataVolume>({
    cluster,
    model: DataVolumeModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataSource
 * @param name the name of the DataSource
 * @param ns  the namespace of the DataSource
 * @param cluster
 * @returns a promise that resolves into the DataSource
 */
export const getDataSource = (name: string, ns: string, cluster?: string) =>
  kubevirtK8sGet<V1beta1DataSource>({
    cluster,
    model: DataSourceModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataSource
 * @param name the name of the DataSource
 * @param ns  the namespace of the DataSource
 * @param cluster
 * @returns a promise that resolves into the DataSource
 */
export const getDataSourcePVC = (name: string, ns: string, cluster?: string) =>
  getDataSource(name, ns, cluster)
    .then((data) => data?.spec?.source?.pvc)
    .then((pvc) => getPVC(pvc.name, pvc.namespace, cluster));

/**
 * a function that returns true if the data source is ready
 * @param dataSource the data source to check if ready
 * @returns true if the data source is ready, false otherwise
 */
export const isDataSourceReady = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some((c) => c.type === 'Ready' && c.status === 'True');

/**
 * a function that returns true if the data source is cloning in progress
 * @param dataSource the data source to check if cloning
 * @returns true if the data source is in cloning state, false otherwise
 */
export const isDataSourceCloning = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some(
    (c) =>
      c.type === 'Ready' &&
      c.status === 'False' &&
      [
        'CloneInProgress',
        'CloneScheduled',
        'CSICloneInProgress',
        'ImportInProgress',
        'ImportScheduled',
        'Pending',
        'PVCBound',
        'SnapshotForSmartCloneInProgress',
      ].includes(c?.reason),
  );

export const isDataSourceUploading = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some(
    (c) => c.type === 'Ready' && c.status === 'False' && c?.reason === 'UploadScheduled',
  );

/**
 * update template's boot source storage class
 * @param template the template to get the boot source from
 * @param storageClassName the storage class name to use
 * @returns - an updated template with storage class name set
 */
export const produceTemplateBootSourceStorageClass = (
  template: V1Template,
  storageClassName: string,
) =>
  produce(template, (templateDraft) => {
    if (storageClassName) {
      const vm = getTemplateVirtualMachineObject(templateDraft);
      const bootDisk = getBootDisk(vm);
      const volume = getVolumes(vm)?.find((vol) => vol.name === bootDisk?.name);

      const otherDataVolumeTemplates = vm?.spec?.dataVolumeTemplates?.filter(
        (dv) => dv.metadata?.name !== volume?.dataVolume?.name,
      );
      const dataVolumeTemplate = vm?.spec?.dataVolumeTemplates?.find(
        (dv) => dv.metadata?.name === volume?.dataVolume?.name,
      );
      dataVolumeTemplate.spec.storage.storageClassName = storageClassName;
      vm.spec.dataVolumeTemplates = [...otherDataVolumeTemplates, dataVolumeTemplate];
    }
  });
