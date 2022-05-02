import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSpec,
  V1DataVolumeTemplateSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { poorManProcess } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getDataVolume,
  getPVC,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sCreate, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

import { MAXIMUM_TIMES_PVC_NOT_DELETED, TIMEOUT_PVC_GETS_DELETED_INTERVAL } from './constants';

const DATA_VOLUME: V1beta1DataVolume = {
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    annotations: {
      'cdi.kubevirt.io/storage.bind.immediate.requested': 'true',
    },
  },
  spec: {},
};

const createDataVolume = (
  name: string,
  namespace: string,
  bootSource: V1beta1DataVolumeSpec,
): V1beta1DataVolume => {
  return produce(DATA_VOLUME, (draftDataVolume) => {
    draftDataVolume.metadata = {
      ...draftDataVolume.metadata,
      name,
      namespace,
    };

    draftDataVolume.spec = bootSource;
  });
};

const getRootDiskDataVolumeTemplate = (
  template: V1Template,
): V1DataVolumeTemplateSpec | undefined => {
  const vm = getTemplateVirtualMachineObject(template);

  const rootVolume = getVolumes(vm)?.find((volume) => volume.name === 'rootdisk');

  return vm?.spec?.dataVolumeTemplates?.find(
    (dataVolumeTemplate) => rootVolume?.dataVolume?.name === dataVolumeTemplate?.metadata?.name,
  );
};

export const hasEditableBootSource = async (template: V1Template): Promise<boolean> => {
  const templateWithDefaultParameters = poorManProcess(template);
  const dataVolume = getRootDiskDataVolumeTemplate(templateWithDefaultParameters);

  if (!dataVolume?.spec?.sourceRef || dataVolume?.spec?.sourceRef?.kind !== DataSourceModel.kind) {
    return false;
  }

  try {
    const dataSource = await getDataSource(
      dataVolume?.spec?.sourceRef.name,
      dataVolume?.spec?.sourceRef.namespace,
    );

    return !dataSource.metadata.labels['cdi.kubevirt.io/dataImportCron'];
  } catch (error) {
    return false;
  }
};

const waitPVCGetDeleted = (name: string, namespace: string): Promise<void> => {
  let timesPVCNotDeleted = 0;
  return new Promise((resolve, reject) => {
    const pvcInterval = setInterval(async () => {
      getPVC(name, namespace)
        .then(() => {
          timesPVCNotDeleted++;

          if (timesPVCNotDeleted === MAXIMUM_TIMES_PVC_NOT_DELETED) {
            reject(new Error('PVC has not been deleted. Retry in a few minutes'));
          }
        })
        .catch(() => {
          clearInterval(pvcInterval);
          resolve();
        });
    }, TIMEOUT_PVC_GETS_DELETED_INTERVAL);
  });
};

export const editBootSource = async (template: V1Template, bootSource: V1beta1DataVolumeSpec) => {
  const templateWithDefaultParameters = poorManProcess(template);
  const dataVolumeTemplate = getRootDiskDataVolumeTemplate(templateWithDefaultParameters);

  const dataSource = await getDataSource(
    dataVolumeTemplate?.spec?.sourceRef.name,
    dataVolumeTemplate?.spec?.sourceRef.namespace,
  );

  const dataSourcePVCName = dataSource?.spec?.source?.pvc?.name;
  const dataSourcePVCNamespace = dataSource?.spec?.source?.pvc?.namespace;

  let dataVolume = null;

  try {
    dataVolume = await getDataVolume(dataSourcePVCName, dataSourcePVCNamespace);
  } catch (error) {}

  if (dataVolume) {
    await k8sDelete({
      model: DataVolumeModel,
      resource: dataVolume,
    });

    await waitPVCGetDeleted(dataSourcePVCName, dataSourcePVCNamespace);
  }

  await k8sCreate<V1beta1DataVolume>({
    model: DataVolumeModel,
    data: createDataVolume(dataSourcePVCName, dataSourcePVCNamespace, bootSource),
  });
};
