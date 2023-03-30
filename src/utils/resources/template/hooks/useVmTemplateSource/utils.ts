import produce from 'immer';

import { PersistentVolumeClaimModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1alpha1PersistentVolumeClaim,
  V1beta1DataVolumeSourceHTTP,
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
  V1beta1DataVolumeSourceRegistry,
  V1ContainerDiskSource,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getBootDisk, getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMBootSourceType } from '@kubevirt-utils/resources/vm/utils/source';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { poorManProcess } from '../../utils';
import { BOOT_SOURCE } from '../../utils/constants';
import { getTemplateVirtualMachineObject } from '../../utils/selectors';

export type TemplateBootSource = {
  type: BOOT_SOURCE;
  source: {
    sourceRef?: V1beta1DataVolumeSourceRef;
    pvc?: V1beta1DataVolumeSourcePVC;
    http?: V1beta1DataVolumeSourceHTTP;
    registry?: V1beta1DataVolumeSourceRegistry;
    containerDisk?: V1ContainerDiskSource;
  };
  sourceValue?: {
    sourceRef?: V1alpha1PersistentVolumeClaim;
    pvc?: V1alpha1PersistentVolumeClaim;
    http?: V1beta1DataVolumeSourceHTTP;
    registry?: V1beta1DataVolumeSourceRegistry;
    containerDisk?: V1ContainerDiskSource;
  };
  storageClassName?: string;
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
 * @returns a promise that resolves into the PVC
 */
export const getPVC = (name: string, ns: string) =>
  k8sGet<V1alpha1PersistentVolumeClaim>({
    model: PersistentVolumeClaimModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataVolume
 * @param name the name of the DataVolume
 * @param ns  the namespace of the DataVolume
 * @returns a promise that resolves into the DataVolume
 */
export const getDataVolume = (name: string, ns: string) =>
  k8sGet<V1beta1DataVolume>({
    model: DataVolumeModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataSource
 * @param name the name of the DataSource
 * @param ns  the namespace of the DataSource
 * @returns a promise that resolves into the DataSource
 */
export const getDataSource = (name: string, ns: string) =>
  k8sGet<V1beta1DataSource>({
    model: DataSourceModel,
    name,
    ns,
  });

/**
 * a function to k8sGet a DataSource
 * @param name the name of the DataSource
 * @param ns  the namespace of the DataSource
 * @returns a promise that resolves into the DataSource
 */
export const getDataSourcePVC = (name: string, ns: string) =>
  getDataSource(name, ns)
    .then((data) => data?.spec?.source?.pvc)
    .then((pvc) => getPVC(pvc.name, pvc.namespace));

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
        'CloneScheduled',
        'CloneInProgress',
        'SnapshotForSmartCloneInProgress',
        'Pending',
        'PVCBound',
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
