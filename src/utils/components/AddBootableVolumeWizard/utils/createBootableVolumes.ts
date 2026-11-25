import type { TFunction } from 'i18next';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  createBootableVolumeFromUpload,
  createDataSourceWithImportCron,
  createHTTPDataSource,
  createPVCBootableVolume,
  createSnapshotDataSource,
  setDataSourceMetadata,
} from '@kubevirt-utils/components/AddBootableVolumeModal/bootableVolumeSources';
import { descriptionAnnotations } from '@kubevirt-utils/components/AddBootableVolumeModal/bootableVolumeSources/createFields';
import type {
  DataSourceMetadataFields,
  DataVolumeSpecFields,
} from '@kubevirt-utils/components/AddBootableVolumeModal/bootableVolumeSources/dataVolumeHelpers';
import {
  DROPDOWN_FORM_SELECTION,
  emptyDataSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import type { CdiUploadDataFn } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import type { BootableVolumeWizardFormValues } from '../form/types';
import {
  type CommonCreateParams,
  createHTTPParams,
  createPVCParams,
  createRegistryParams,
  createSnapshotParams,
  createUploadParams,
} from './createBootableVolumeParams';

type CreateBootableVolumesArgs = {
  cluster?: string;
  onCreateVolume?: (createdVolume: BootableVolume) => void;
  onUploadStart?: (uploadKey: string) => void;
  t: TFunction;
  uploadData: CdiUploadDataFn;
  values: BootableVolumeWizardFormValues;
};

const dataVolumeSpec = (
  values: BootableVolumeWizardFormValues,
  name: string,
): DataVolumeSpecFields => ({
  accessMode: values.imageSource.accessMode,
  labels: values.operatingSystem.labels,
  name,
  size: values.imageSource.diskSize,
  storageClassName: values.imageSource.storageClassName,
  volumeMode: values.imageSource.volumeMode,
});

const dataSourceMetadata = (values: BootableVolumeWizardFormValues): DataSourceMetadataFields => ({
  annotations: descriptionAnnotations(values.projectAndVolume.description),
  isIso: values.imageSource.isIso,
  labels: values.operatingSystem.labels,
  name: values.projectAndVolume.volumeName,
});

const createOne = async ({
  arch,
  cluster,
  onUploadStart,
  t,
  uploadData,
  values,
}: {
  arch?: string;
  cluster?: string;
  onUploadStart?: (uploadKey: string) => void;
  t: TFunction;
  uploadData: CdiUploadDataFn;
  values: BootableVolumeWizardFormValues;
}): Promise<V1beta1DataSource> => {
  const { imageSource, projectAndVolume } = values;
  const namespace = projectAndVolume.destinationProject;
  const sourceType = imageSource.sourceType;

  const draftDataSource = setDataSourceMetadata(
    dataSourceMetadata(values),
    namespace,
    emptyDataSource,
    arch,
    sourceType,
  );

  const volumeName = getName(draftDataSource) ?? projectAndVolume.volumeName;
  const dataVolume = dataVolumeSpec(values, volumeName);

  const common: CommonCreateParams = { cluster, dataVolume, draftDataSource, namespace };

  const actionBySourceType: Record<string, () => Promise<V1beta1DataSource>> = {
    [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: () =>
      createBootableVolumeFromUpload(
        createUploadParams(values, common, { onUploadStart, t, uploadData }),
      ),
    [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: () =>
      createPVCBootableVolume(createPVCParams(values, common)),
    [DROPDOWN_FORM_SELECTION.USE_HTTP]: () =>
      createHTTPDataSource(createHTTPParams(values, common)),
    [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: () =>
      createDataSourceWithImportCron(createRegistryParams(values, common)),
    [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: () =>
      createSnapshotDataSource(createSnapshotParams(values, common)),
  };

  return actionBySourceType[sourceType]();
};

/** Create bootable volume DataSources from wizard form values. */
export const createBootableVolumes = async ({
  cluster,
  onCreateVolume,
  onUploadStart,
  t,
  uploadData,
  values,
}: CreateBootableVolumesArgs): Promise<V1beta1DataSource[]> => {
  const architectures = values.operatingSystem.architectures;

  if (!isEmpty(architectures)) {
    const dataSources = await Promise.all(
      architectures.map((arch) =>
        createOne({ arch, cluster, onUploadStart, t, uploadData, values }),
      ),
    );
    onCreateVolume?.(dataSources[0]);
    return dataSources;
  }

  const dataSource = await createOne({ cluster, onUploadStart, t, uploadData, values });
  onCreateVolume?.(dataSource);
  return [dataSource];
};
