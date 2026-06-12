import { TFunction } from 'i18next';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  createBootableVolumeFromUpload,
  createDataSourceWithImportCron,
  createHTTPDataSource,
  createPVCBootableVolume,
  createSnapshotDataSource,
  setDataSourceMetadata,
} from './bootableVolumeSources';
import { DROPDOWN_FORM_SELECTION } from './consts';
import { AddBootableVolumeState, CreateBootableVolumeType } from './types';

const getBootableVolumePromise = ({
  arch,
  bootableVolume,
  dataSource,
  sourceType,
  t,
  uploadData,
}: {
  arch?: string;
  bootableVolume: AddBootableVolumeState;
  dataSource: V1beta1DataSource;
  sourceType: DROPDOWN_FORM_SELECTION;
  t: TFunction;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => {
  const { bootableVolumeNamespace } = bootableVolume;

  const draftDataSource = setDataSourceMetadata(
    bootableVolume,
    bootableVolumeNamespace,
    dataSource,
    arch,
  );

  const actionBySourceType: Record<string, () => Promise<V1beta1DataSource>> = {
    [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: () =>
      createBootableVolumeFromUpload(
        bootableVolume,
        bootableVolumeNamespace,
        draftDataSource,
        uploadData,
        t,
      ),
    [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: () =>
      createPVCBootableVolume(bootableVolume, bootableVolumeNamespace, draftDataSource),
    [DROPDOWN_FORM_SELECTION.USE_HTTP]: () =>
      createHTTPDataSource(bootableVolume, draftDataSource, bootableVolumeNamespace),
    [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: () =>
      createDataSourceWithImportCron(bootableVolume, draftDataSource),
    [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: () =>
      createSnapshotDataSource(bootableVolume, draftDataSource),
  };

  return actionBySourceType[sourceType]();
};

export const createBootableVolume: CreateBootableVolumeType =
  ({ bootableVolume, onCreateVolume, sourceType, t, uploadData }) =>
  async (dataSource: V1beta1DataSource) => {
    const architectures = bootableVolume?.architectures;

    if (!isEmpty(architectures)) {
      const dataSourcePromises = architectures?.map((arch) =>
        getBootableVolumePromise({ arch, bootableVolume, dataSource, sourceType, t, uploadData }),
      );

      const newDataSources = await Promise.all(dataSourcePromises);

      onCreateVolume?.(newDataSources?.[0]);

      return newDataSources;
    }

    const dataSourceWithoutArch = await getBootableVolumePromise({
      bootableVolume,
      dataSource,
      sourceType,
      t,
      uploadData,
    });

    onCreateVolume?.(dataSourceWithoutArch);

    return [dataSourceWithoutArch];
  };
