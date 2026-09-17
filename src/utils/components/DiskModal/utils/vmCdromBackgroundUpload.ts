import type { TFunction } from 'i18next';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import type { CdiUploadDataFn } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { completeVmCdromUpload } from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadCompletion';
import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { uploadDataVolume } from './submit';
import type { V1DiskFormState } from './types';

export const getVmCdromAbortTooltip = (isHotPluggable: boolean, t: TFunction): string =>
  isHotPluggable ? t('Eject CD-ROM') : t('Detach CD-ROM drive');

export const logBackgroundUploadError = (error: unknown): void => {
  if (!isUploadCanceledError(error)) {
    kubevirtConsole.error(error);
  }
};

type RunVmCdromBackgroundUploadParams = {
  diskState: V1DiskFormState;
  dvName: string;
  isHotPluggable: boolean;
  onCancelCleanup: () => Promise<void>;
  onUploadedDataVolume?: (uploaded: V1beta1DataVolume) => void;
  t: TFunction;
  uploadData: CdiUploadDataFn;
  uploadKey: string;
  vm: V1VirtualMachine;
};

export const runVmCdromBackgroundUpload = async ({
  diskState,
  dvName,
  isHotPluggable,
  onCancelCleanup,
  onUploadedDataVolume,
  t,
  uploadData,
  uploadKey,
  vm,
}: RunVmCdromBackgroundUploadParams): Promise<void> => {
  let expectedGeneration: number | undefined;

  try {
    const { dataVolume: uploaded, expectedGeneration: uploadGeneration } = await uploadDataVolume({
      data: diskState,
      dvName,
      options: {
        abortTooltip: getVmCdromAbortTooltip(isHotPluggable, t),
        onCancelCleanup,
      },
      t,
      uploadData,
      uploadKey,
      vm,
    });
    expectedGeneration = uploadGeneration;

    onUploadedDataVolume?.(uploaded);

    await completeVmCdromUpload({
      dataVolumeName: dvName,
      diskName: diskState.disk.name,
      expectedGeneration,
      t,
      uploadKey,
      vm,
    });
  } catch (error) {
    if (isUploadCanceledError(error)) {
      return;
    }

    if (expectedGeneration !== undefined) {
      useUploadProgressStore
        .getState()
        .failUpload(
          uploadKey,
          error instanceof Error ? error.message : String(error),
          expectedGeneration,
        );
    }

    throw error;
  }
};
