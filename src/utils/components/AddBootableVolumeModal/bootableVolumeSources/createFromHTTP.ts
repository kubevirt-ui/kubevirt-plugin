import produce from 'immer';

import {
  ConfigMapModel,
  DataSourceModel,
  DataVolumeModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1DataVolumeSource } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getOrCreateTLSCertConfigMapName } from '@kubevirt-utils/components/TLSCertificateSection';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { type AddBootableVolumeState } from '../types';

import { getDataVolumeWithSource } from './dataVolumeHelpers';

export const createHTTPDataSource = async (
  bootableVolume: AddBootableVolumeState,
  draftDataSource: V1beta1DataSource,
  namespace: string,
): Promise<V1beta1DataSource> => {
  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });

  const certConfigMapName = await getOrCreateTLSCertConfigMapName(
    {
      cluster: bootableVolume.bootableVolumeCluster,
      tlsCertConfigMapName: bootableVolume.tlsCertConfigMapName,
      tlsCertificate: bootableVolume.tlsCertificate,
      tlsCertificateRequired: bootableVolume.tlsCertificateRequired,
      tlsCertProject: bootableVolume.tlsCertProject,
      tlsCertSource: bootableVolume.tlsCertSource,
    },
    namespace,
  );

  const httpSource: V1beta1DataVolumeSource['http'] = {
    url: bootableVolume.url,
    ...(certConfigMapName && { certConfigMap: certConfigMapName }),
  };

  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    http: httpSource,
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const createdDS = await kubevirtK8sCreate({
    cluster: bootableVolume.bootableVolumeCluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
    ns: namespace,
  });

  try {
    await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: bootableVolumeToCreate,
      model: DataVolumeModel,
      ns: namespace,
    });
  } catch (error) {
    const cleanups: Promise<unknown>[] = [
      kubevirtK8sDelete({
        cluster: bootableVolume.bootableVolumeCluster,
        model: DataSourceModel,
        resource: createdDS,
      }),
    ];
    if (certConfigMapName) {
      cleanups.push(
        kubevirtK8sDelete({
          cluster: bootableVolume.bootableVolumeCluster,
          model: ConfigMapModel,
          resource: { metadata: { name: certConfigMapName, namespace } },
        }),
      );
    }
    await Promise.allSettled(cleanups);
    throw error;
  }
  return createdDS;
};
