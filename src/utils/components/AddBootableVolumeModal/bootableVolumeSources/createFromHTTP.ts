import produce from 'immer';

import {
  ConfigMapModel,
  DataSourceModel,
  DataVolumeModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1DataVolumeSource } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getOrCreateTLSCertConfigMapName,
  type TLSCertSourceType,
} from '@kubevirt-utils/components/TLSCertificateSection';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { type DataVolumeSpecFields, getDataVolumeWithSource } from './dataVolumeHelpers';

export type CreateHTTPBootableVolumeArgs = {
  cluster?: string;
  dataVolume: DataVolumeSpecFields;
  draftDataSource: V1beta1DataSource;
  namespace: string;
  tlsCertConfigMapName?: string;
  tlsCertificate?: string;
  tlsCertificateRequired?: boolean;
  tlsCertProject?: string;
  tlsCertSource?: TLSCertSourceType;
  url?: string;
};

export const createHTTPDataSource = async ({
  cluster,
  dataVolume,
  draftDataSource,
  namespace,
  tlsCertConfigMapName,
  tlsCertificate,
  tlsCertificateRequired,
  tlsCertProject,
  tlsCertSource,
  url,
}: CreateHTTPBootableVolumeArgs): Promise<V1beta1DataSource> => {
  const { configMapName: certConfigMapName, created: certConfigMapCreated } =
    await getOrCreateTLSCertConfigMapName(
      {
        cluster,
        tlsCertConfigMapName,
        tlsCertificate,
        tlsCertificateRequired,
        tlsCertProject,
        tlsCertSource,
      },
      namespace,
    );

  const httpSource: V1beta1DataVolumeSource['http'] = {
    url,
    ...(certConfigMapName && { certConfigMap: certConfigMapName }),
  };

  const bootableVolumeToCreate = getDataVolumeWithSource(dataVolume, namespace, {
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

  const deleteCreatedCertConfigMap = (): Promise<unknown> | undefined => {
    if (!certConfigMapCreated || !certConfigMapName) {
      return undefined;
    }

    return kubevirtK8sDelete({
      cluster,
      model: ConfigMapModel,
      resource: { metadata: { name: certConfigMapName, namespace } },
    });
  };

  try {
    const createdDS = await kubevirtK8sCreate({
      cluster,
      data: dataSourceToCreate,
      model: DataSourceModel,
      ns: namespace,
    });

    try {
      await kubevirtK8sCreate({
        cluster,
        data: bootableVolumeToCreate,
        model: DataVolumeModel,
        ns: namespace,
      });
    } catch (error) {
      const cleanups: Promise<unknown>[] = [
        kubevirtK8sDelete({
          cluster,
          model: DataSourceModel,
          resource: createdDS,
        }),
      ];
      const certConfigMapCleanup = deleteCreatedCertConfigMap();
      if (certConfigMapCleanup) {
        cleanups.push(certConfigMapCleanup);
      }
      await Promise.allSettled(cleanups);
      throw error;
    }

    return createdDS;
  } catch (error) {
    const certConfigMapCleanup = deleteCreatedCertConfigMap();
    if (certConfigMapCleanup) {
      await Promise.allSettled([certConfigMapCleanup]);
    }
    throw error;
  }
};
