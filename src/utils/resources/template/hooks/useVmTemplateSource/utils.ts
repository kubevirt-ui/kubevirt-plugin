import produce from 'immer';

import { PersistentVolumeClaimModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1beta1DataVolumeSourceHTTP,
  type V1beta1DataVolumeSourcePVC,
  type V1beta1DataVolumeSourceRef,
  type V1beta1DataVolumeSourceRegistry,
  type V1beta1DataVolumeSourceSnapshot,
  type V1beta1PersistentVolumeClaim,
  type V1ContainerDiskSource,
  type V1DataVolumeTemplateSpec,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getBootDisk, getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMBootSourceType } from '@kubevirt-utils/resources/vm/utils/source';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { isOpenShiftTemplate, poorManProcess, type Template } from '../../utils';
import { type BOOT_SOURCE } from '../../utils/constants';
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
export const getTemplateBootSourceType = (template: Template): TemplateBootSource =>
  getVMBootSourceType(
    getTemplateVirtualMachineObject(
      isOpenShiftTemplate(template) ? poorManProcess(template) : template,
    ),
  );

/**
 * a function to k8sGet a PVC
 * @param name the name of the PVC
 * @param ns  the namespace of the PVC
 * @param cluster
 * @returns a promise that resolves into the PVC
 */
export const getPVC = (
  name: string,
  ns: string,
  cluster?: string,
): Promise<IoK8sApiCoreV1PersistentVolumeClaim> =>
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
export const getDataVolume = (
  name: string,
  ns: string,
  cluster?: string,
): Promise<V1beta1DataVolume> =>
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
export const getDataSource = (
  name: string,
  ns: string,
  cluster?: string,
): Promise<V1beta1DataSource> =>
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
export const getDataSourcePVC = (
  name: string,
  ns: string,
  cluster?: string,
): Promise<IoK8sApiCoreV1PersistentVolumeClaim> =>
  getDataSource(name, ns, cluster)
    .then((data) => data?.spec?.source?.pvc)
    .then((pvc) => getPVC(pvc.name, pvc.namespace, cluster));

/**
 * a function that returns true if the data source is ready
 * @param dataSource the data source to check if ready
 * @returns true if the data source is ready, false otherwise
 */
export const isDataSourceReady = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );

/**
 * a function that returns true if the data source is cloning in progress
 * @param dataSource the data source to check if cloning
 * @returns true if the data source is in cloning state, false otherwise
 */
export const isDataSourceCloning = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some(
    (condition) =>
      condition.type === 'Ready' &&
      condition.status === 'False' &&
      [
        'CloneInProgress',
        'CloneScheduled',
        'CSICloneInProgress',
        'ImportInProgress',
        'ImportScheduled',
        'Pending',
        'PVCBound',
        'SnapshotForSmartCloneInProgress',
      ].includes(condition?.reason),
  );

export const isDataSourceUploading = (dataSource: V1beta1DataSource): boolean =>
  dataSource?.status?.conditions?.some(
    (condition) =>
      condition.type === 'Ready' &&
      condition.status === 'False' &&
      condition?.reason === 'UploadScheduled',
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
): V1Template =>
  produce(template, (templateDraft) => {
    if (storageClassName) {
      const vm = getTemplateVirtualMachineObject(templateDraft);
      const bootDisk = getBootDisk(vm);
      const volume = getVolumes(vm)?.find((vol) => vol.name === bootDisk?.name);
      const dvTemplates: V1DataVolumeTemplateSpec[] = vm?.spec?.dataVolumeTemplates ?? [];

      const otherDataVolumeTemplates = dvTemplates.filter(
        (dvTemplate) => dvTemplate.metadata?.name !== volume?.dataVolume?.name,
      );
      const dataVolumeTemplate = dvTemplates.find(
        (dvTemplate) => dvTemplate.metadata?.name === volume?.dataVolume?.name,
      );
      if (dataVolumeTemplate?.spec?.storage) {
        dataVolumeTemplate.spec.storage.storageClassName = storageClassName;
      }
      vm.spec.dataVolumeTemplates = [
        ...otherDataVolumeTemplates,
        ...(dataVolumeTemplate ? [dataVolumeTemplate] : []),
      ];
    }
  });
