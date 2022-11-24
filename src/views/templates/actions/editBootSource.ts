import { TFunction } from 'react-i18next';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSpec,
  V1DataVolumeTemplateSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  getTemplateVirtualMachineObject,
  poorManProcess,
} from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getDataVolume,
  getPVC,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sCreate, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

import { appendDockerPrefix } from './components/utils';
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

export const createDataVolume = (
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

    if (bootSource?.source?.registry?.url) {
      bootSource.source.registry.url = appendDockerPrefix(bootSource?.source?.registry?.url);
    }
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

export const getBootDataSource = async (
  template: V1Template,
): Promise<V1beta1DataSource | undefined> => {
  const templateWithDefaultParameters = poorManProcess(template);
  const dataVolume = getRootDiskDataVolumeTemplate(templateWithDefaultParameters);

  if (
    dataVolume?.spec?.sourceRef?.kind === DataSourceModel.kind &&
    dataVolume?.spec?.sourceRef?.name
  )
    return await getDataSource(
      dataVolume?.spec?.sourceRef?.name,
      dataVolume?.spec?.sourceRef?.namespace || dataVolume.metadata.namespace || DEFAULT_NAMESPACE,
    );
};

export const getDataSourceDataVolume = async (
  dataSourcePVCName: string,
  dataSourcePVCNamespace: string,
): Promise<V1beta1DataVolume | undefined> => {
  let dataVolume: V1beta1DataVolume = null;

  try {
    dataVolume = await getDataVolume(dataSourcePVCName, dataSourcePVCNamespace);
  } catch (error) {
    // If raised error means that dataVolume is not available
    console.error(error);
  }

  return dataVolume;
};

export const hasEditableBootSource = (dataSource: V1beta1DataSource): boolean => {
  return dataSource && !dataSource.metadata.labels?.['cdi.kubevirt.io/dataImportCron'];
};

const waitPVCGetDeleted = (name: string, namespace: string): Promise<void> => {
  let timesPVCNotDeleted = 0;
  return new Promise((resolve, reject) => {
    const pvcInterval = setInterval(() => {
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

export const editBootSource = async (
  dataSource: V1beta1DataSource,
  bootSource: V1beta1DataVolumeSpec,
) => {
  const dataSourcePVCName = dataSource?.spec?.source?.pvc?.name;
  const dataSourcePVCNamespace = dataSource?.spec?.source?.pvc?.namespace;

  const dataVolume = await getDataSourceDataVolume(dataSourcePVCName, dataSourcePVCNamespace);

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

export const getEditBootSourceRefDescription = (
  t: TFunction,
  dataSource: V1beta1DataSource,
  canEditBootSource: boolean,
) => {
  if (!canEditBootSource) return t('This user is not allowed to edit this boot source');
  if (!dataSource) return t('Template does not use boot source reference');
  if (!hasEditableBootSource(dataSource)) return t('Boot source reference cannot be edited');
};
