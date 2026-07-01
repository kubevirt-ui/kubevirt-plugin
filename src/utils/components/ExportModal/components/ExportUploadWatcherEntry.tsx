import { type FC, useEffect, useRef } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { useUploadProgressStore } from '../../../hooks/useUploadProgressToast/uploadProgressStore';
import { getExportDiskUploadKey } from '../../../hooks/useUploadProgressToast/keys/uploadKeys';
import { type ExportUploadState, useExportUploadStore } from '../exportUploadStore';
import { UploaderPhase } from '../hooks/types';
import useUploaderProgress from '../hooks/useUploaderProgress';
import { exportFailed, exportSucceeded, getExportErrorMessage } from '../utils';

type ExportUploadWatcherEntryProps = {
  upload: ExportUploadState;
};

const deleteSecret = (cluster: string, namespace: string, secretName: string): void => {
  kubevirtK8sDelete({
    cluster,
    model: SecretModel,
    resource: { metadata: { name: secretName, namespace } },
  }).catch((err) => kubevirtConsole.log('Failed to clean up export secret:', err));
};

const ExportUploadWatcherEntry: FC<ExportUploadWatcherEntryProps> = ({ upload }) => {
  const { t } = useKubevirtTranslation();
  const { cluster, namespace, podName, pvcName, secretName } = upload;
  const uploadKey = getExportDiskUploadKey(cluster, namespace, pvcName);
  const prevPercentageRef = useRef(-1);
  const finishedRef = useRef(false);

  const [pod, loaded, watchError] = useKubevirtWatchResource<IoK8sApiCoreV1Pod>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    name: podName,
    namespace,
  });

  const progress = useUploaderProgress(loaded ? pod : undefined);

  useEffect(() => {
    if (watchError) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      useUploadProgressStore.getState().failUpload(uploadKey, watchError.message);
      useExportUploadStore.getState().clearUpload(cluster, namespace, pvcName);
    }
  }, [watchError, uploadKey, cluster, namespace, pvcName, secretName]);

  useEffect(() => {
    if (
      !finishedRef.current &&
      progress.percentage !== prevPercentageRef.current &&
      progress.phase !== UploaderPhase.Idle
    ) {
      prevPercentageRef.current = progress.percentage;
      useUploadProgressStore.getState().updateProgress(uploadKey, progress.percentage);
    }
  }, [progress.percentage, progress.phase, uploadKey]);

  useEffect(() => {
    if (finishedRef.current || !loaded) {
      return;
    }

    if (exportSucceeded(pod)) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      const podLogsUrl = `${getResourceUrl({ model: PodModel, resource: pod })}/logs`;
      useUploadProgressStore.getState().completeUpload(uploadKey, {
        resourceName: podName,
        successLinks: [{ label: t('View pod logs'), url: podLogsUrl }],
      });
      useExportUploadStore.getState().clearUpload(cluster, namespace, pvcName);
    }

    if (exportFailed(pod)) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      const errorMessage = getExportErrorMessage(pod, progress.errorMessage) ?? t('Unknown error');
      useUploadProgressStore.getState().failUpload(uploadKey, errorMessage);
      useExportUploadStore.getState().clearUpload(cluster, namespace, pvcName);
    }
  }, [
    pod,
    loaded,
    progress.errorMessage,
    cluster,
    namespace,
    pvcName,
    podName,
    secretName,
    uploadKey,
    t,
  ]);

  return null;
};

export default ExportUploadWatcherEntry;
