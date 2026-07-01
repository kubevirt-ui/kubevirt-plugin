import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { completeVmCdromUpload } from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadCompletion';
import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { uploadDataVolume } from './submit';
import { V1DiskFormState } from './types';

export const getVmCdromAbortTooltip = (isHotPluggable: boolean, t: TFunction): string =>
  isHotPluggable ? t('Eject CD-ROM') : t('Detach CD-ROM drive');

export const logBackgroundUploadError = (error: unknown): void => {
  if (!isUploadCanceledError(error)) {
    kubevirtConsole.error(error);
  }
};

type RunVmCdromBackgroundUploadParams = {
  afterUpload?: () => Promise<void>;
  diskState: V1DiskFormState;
  dvName: string;
  isHotPluggable: boolean;
  onCancelCleanup: () => Promise<void>;
  onUploadedDataVolume?: (uploaded: Awaited<ReturnType<typeof uploadDataVolume>>) => void;
  t: TFunction;
  uploadData: (props: UploadDataProps) => Promise<void>;
  uploadKey: string;
  vm: V1VirtualMachine;
};

export const runVmCdromBackgroundUpload = async ({
  afterUpload,
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
  try {
    const uploaded = await uploadDataVolume({
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

    onUploadedDataVolume?.(uploaded);

    await afterUpload?.();

    completeVmCdromUpload({
      dataVolumeName: dvName,
      diskName: diskState.disk.name,
      t,
      uploadKey,
      vm,
    });
  } catch (error) {
    if (isUploadCanceledError(error)) {
      return;
    }

    useUploadProgressStore
      .getState()
      .failUpload(uploadKey, error instanceof Error ? error.message : String(error));

    throw error;
  }
};
