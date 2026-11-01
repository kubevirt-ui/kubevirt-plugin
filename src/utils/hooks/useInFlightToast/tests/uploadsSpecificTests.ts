/* eslint-disable max-lines */
import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useInFlightToastStore } from '../inFlightToastStore';

import {
  getBootableVolumesListUrl,
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrlForIdentity,
} from '../completion/uploadLinks';
import {
  getBootableVolumeUploadKey,
  getExportDiskUploadKey,
  getVmCdromUploadKey,
  getVmDiskUploadKey,
} from '../keys/uploadKeys';
import {
  BOOTABLE_VOLUME_NAME,
  BOOTABLE_VOLUME_NAMESPACE,
  CDROM_NAME,
  CLUSTER,
  DV_NAME,
  FILE_IMAGE_ISO,
  NAMESPACE,
  OTHER_VM_NAME,
  VM_DISK_NAME,
  VM_NAME,
} from './inFlightToastStore.test';

export const describeUploadsSpecific = (): void => {
  describe('cancelTrackedUpload - bootable volume link stripping', () => {
    it('should strip the bootable volumes list link when a bootable volume upload is aborted', async () => {
      const uploadKey = getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);
      const listLink = {
        label: 'Bootable volume fedora-40',
        url: getBootableVolumesListUrl(BOOTABLE_VOLUME_NAMESPACE),
      };
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(uploadKey, {
        cancelUpload,
        contextLinks: [listLink],
        dvName: BOOTABLE_VOLUME_NAME,
        dvNamespace: BOOTABLE_VOLUME_NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(uploadKey);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
      expect(upload?.omittedLinkUrls).toEqual(expect.arrayContaining([listLink.url]));
    });
  });

  describe('cancelUploadsForVm', () => {
    it('should cancel all vm-disk and vm-cdrom uploads for the VM', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const otherVmUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, OTHER_VM_NAME, VM_DISK_NAME);
      const diskCancelUpload = jest.fn(async () => undefined);
      const cdromCancelUpload = jest.fn(async () => undefined);
      const bootableCancelUpload = jest.fn(async () => undefined);
      const otherVmCancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload: cdromCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmUploadKey, {
        cancelUpload: otherVmCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).toHaveBeenCalledTimes(1);
      expect(cdromCancelUpload).toHaveBeenCalledTimes(1);
      expect(bootableCancelUpload).not.toHaveBeenCalled();
      expect(otherVmCancelUpload).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey)
          ?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });

    it('should no-op when no uploads match the VM', async () => {
      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
    });

    it('should not cancel completed uploads for the VM', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const diskCancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(diskUploadKey);

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.SUCCESS);
    });

    it('should strip VM storage and DataVolume links from an already-canceled upload when the VM is deleted', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      const dataVolumeLink = {
        label: 'View DataVolume',
        url: getDataVolumeUrl(DV_NAME, NAMESPACE),
      };

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        contextLinks: [{ label: 'View disk', url: storageUrl }, dataVolumeLink],
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(diskUploadKey);

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
    });

    it('should cancel empty-cluster uploads when deleting an ACM fleet VM', async () => {
      const emptyClusterUploadKey = getVmDiskUploadKey('', NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(emptyClusterUploadKey, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(emptyClusterUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
    });

    it('should strip the View storage link from an in-progress CD-ROM upload when the VM is deleted', async () => {
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload,
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey);
      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
      expect(upload?.omittedLinkUrls).toEqual(expect.arrayContaining([storageUrl]));
    });

    it('should leave a same-key retry untouched when the original abort finishes after replacement', async () => {
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      let resolveCancel: () => void = () => undefined;
      const cancelUpload = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveCancel = resolve;
          }),
      );

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload,
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: FILE_IMAGE_ISO,
      });

      const cancelPromise = useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: 'retry.iso',
      });

      resolveCancel();
      await cancelPromise;

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey);
      expect(upload?.fileName).toBe('retry.iso');
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(upload?.contextLinks).toEqual([{ label: 'View test-vm storage', url: storageUrl }]);
    });
  });

  describe('cancelWizardPendingUploads', () => {
    it('should cancel registered wizard uploads without canceling other VM uploads', async () => {
      const wizardDiskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const wizardCdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const otherVmCdromUploadKey = getVmCdromUploadKey(
        CLUSTER,
        NAMESPACE,
        OTHER_VM_NAME,
        CDROM_NAME,
      );
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const exportDiskUploadKey = getExportDiskUploadKey(CLUSTER, NAMESPACE, 'export-pvc');
      const wizardDiskCancel = jest.fn(async () => undefined);
      const wizardCdromCancel = jest.fn(async () => undefined);
      const otherVmCdromCancel = jest.fn(async () => undefined);
      const bootableCancel = jest.fn(async () => undefined);
      const exportDiskCancel = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(wizardDiskUploadKey, {
        cancelUpload: wizardDiskCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(wizardCdromUploadKey, {
        cancelUpload: wizardCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmCdromUploadKey, {
        cancelUpload: otherVmCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().exportDisk.actions?.startUpload(exportDiskUploadKey, {
        cluster: CLUSTER,
        entry: {
          cancelUpload: exportDiskCancel,
          fileName: FILE_IMAGE_ISO,
        },
        pod: { metadata: { name: 'export-pod', namespace: NAMESPACE } } as never,
        pvcName: 'export-pvc',
        secretName: 'export-secret',
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelWizardPendingUploads([
          wizardDiskUploadKey,
          wizardCdromUploadKey,
          bootableVolumeUploadKey,
        ]);

      expect(wizardDiskCancel).toHaveBeenCalledTimes(1);
      expect(wizardCdromCancel).toHaveBeenCalledTimes(1);
      expect(bootableCancel).toHaveBeenCalledTimes(1);
      expect(otherVmCdromCancel).not.toHaveBeenCalled();
      expect(exportDiskCancel).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(wizardDiskUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(wizardCdromUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmCdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(
        useInFlightToastStore.getState().exportDisk.actions?.getUpload(exportDiskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });

    it('should cancel bootable-volume uploads when no draft VM is provided', async () => {
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const otherVmCdromUploadKey = getVmCdromUploadKey(
        CLUSTER,
        NAMESPACE,
        OTHER_VM_NAME,
        CDROM_NAME,
      );
      const bootableCancel = jest.fn(async () => undefined);
      const otherVmCdromCancel = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmCdromUploadKey, {
        cancelUpload: otherVmCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelWizardPendingUploads([bootableVolumeUploadKey]);

      expect(bootableCancel).toHaveBeenCalledTimes(1);
      expect(otherVmCdromCancel).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmCdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });
  });

  describe('stripBootableVolumeLinks', () => {
    it('should remove the success link after the bootable volume is deleted', () => {
      const uploadKey = getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);
      const volumeUrl = getBootableVolumeUrl(BOOTABLE_VOLUME_NAME, BOOTABLE_VOLUME_NAMESPACE);

      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(uploadKey, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(uploadKey, {
        successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
      });

      useInFlightToastStore
        .getState()
        .uploads.actions?.stripBootableVolumeLinks(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey)?.successLinks,
      ).toEqual([]);
    });
  });

  describe('stripDataVolumeLinksForResource', () => {
    it('should remove the bootable volume success link when its DataVolume is deleted', () => {
      const uploadKey = getBootableVolumeUploadKey(NAMESPACE, BOOTABLE_VOLUME_NAME);
      const volumeUrl = getBootableVolumeUrl(BOOTABLE_VOLUME_NAME, NAMESPACE);

      useInFlightToastStore.getState().uploads.actions?.startUpload(uploadKey, {
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(uploadKey, {
        successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
      });

      useInFlightToastStore
        .getState()
        .uploads.actions?.stripDataVolumeLinksForResource(DV_NAME, NAMESPACE);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey)?.successLinks,
      ).toEqual([]);
    });
  });
};
