import { type TFunction } from 'i18next';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { CdiUploadDataFn } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  createBootableVolumeFromUpload,
  createDataSourceWithImportCron,
  createHTTPDataSource,
  createPVCBootableVolume,
  createSnapshotDataSource,
  setDataSourceMetadata,
} from './bootableVolumeSources';
import {
  dataSourceMetadataFromCreateParams,
  dataVolumeSpecFromCreateParams,
} from './bootableVolumeSources/createFields';
import { DROPDOWN_FORM_SELECTION } from './consts';
import { type AddBootableVolumeState, type CreateBootableVolumeType } from './types';

const getBootableVolumePromise = ({
  arch,
  createParams,
  dataSource,
  onUploadStart,
  sourceType,
  t,
  uploadData,
}: {
  arch?: string;
  createParams: AddBootableVolumeState;
  dataSource: V1beta1DataSource;
  onUploadStart?: (uploadKey: string) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  t: TFunction;
  uploadData: CdiUploadDataFn;
}): Promise<V1beta1DataSource> => {
  const namespace = createParams.bootableVolumeNamespace;
  const cluster = createParams.bootableVolumeCluster;

  const draftDataSource = setDataSourceMetadata(
    dataSourceMetadataFromCreateParams(createParams),
    namespace,
    dataSource,
    arch,
    sourceType,
  );

  const volumeName = getName(draftDataSource) ?? createParams.bootableVolumeName;
  const dataVolume = dataVolumeSpecFromCreateParams(createParams, volumeName);

  const actionBySourceType: Record<string, () => Promise<V1beta1DataSource>> = {
    [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: () =>
      createBootableVolumeFromUpload({
        cluster,
        dataVolume,
        draftDataSource,
        namespace,
        onUploadStart,
        t,
        uploadData,
        uploadFile: createParams.uploadFile,
      }),
    [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: () =>
      createPVCBootableVolume({
        cluster,
        dataVolume,
        draftDataSource,
        namespace,
        pvcName: createParams.pvcName,
        pvcNamespace: createParams.pvcNamespace,
      }),
    [DROPDOWN_FORM_SELECTION.USE_HTTP]: () =>
      createHTTPDataSource({
        cluster,
        dataVolume,
        draftDataSource,
        namespace,
        tlsCertConfigMapName: createParams.tlsCertConfigMapName,
        tlsCertificate: createParams.tlsCertificate,
        tlsCertificateRequired: createParams.tlsCertificateRequired,
        tlsCertProject: createParams.tlsCertProject,
        tlsCertSource: createParams.tlsCertSource,
        url: createParams.url,
      }),
    [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: () =>
      createDataSourceWithImportCron({
        cluster,
        cronExpression: createParams.cronExpression,
        draftDataSource,
        password: createParams.registryCredentials?.password,
        registryURL: createParams.registryURL,
        retainRevisions: createParams.retainRevisions,
        size: createParams.size,
        storageClassName: createParams.storageClassName,
        username: createParams.registryCredentials?.username,
      }),
    [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: () =>
      createSnapshotDataSource({
        cluster,
        draftDataSource,
        snapshotName: createParams.snapshotName,
        snapshotNamespace: createParams.snapshotNamespace,
      }),
  };

  return actionBySourceType[sourceType]();
};

export const createBootableVolume: CreateBootableVolumeType =
  ({ createParams, onCreateVolume, onUploadStart, sourceType, t, uploadData }) =>
  async (dataSource: V1beta1DataSource): Promise<V1beta1DataSource[]> => {
    const architectures = createParams?.architectures;

    if (!isEmpty(architectures)) {
      const dataSourcePromises = architectures?.map((arch) =>
        getBootableVolumePromise({
          arch,
          createParams,
          dataSource,
          onUploadStart,
          sourceType,
          t,
          uploadData,
        }),
      );

      const newDataSources = await Promise.all(dataSourcePromises);

      onCreateVolume?.(newDataSources?.[0]);

      return newDataSources;
    }

    const dataSourceWithoutArch = await getBootableVolumePromise({
      createParams,
      dataSource,
      onUploadStart,
      sourceType,
      t,
      uploadData,
    });

    onCreateVolume?.(dataSourceWithoutArch);

    return [dataSourceWithoutArch];
  };
