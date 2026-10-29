import { type FC, useEffect, useRef } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type ExportDiskContext } from '@kubevirt-utils/hooks/useInFlightToast/features/exportDisk/types/types';
import { useInFlightToastStore } from '@kubevirt-utils/hooks/useInFlightToast/inFlightToastStore';
import { getExportDiskUploadKey } from '@kubevirt-utils/hooks/useInFlightToast/keys/uploadKeys';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { UploaderPhase } from '../hooks/types';
import useUploaderProgress from '../hooks/useUploaderProgress';
import { exportFailed, exportSucceeded, getExportErrorMessage } from '../utils/utils';

type ExportUploadWatcherEntryProps = {
  upload: ExportDiskContext;
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
  const generationRef = useRef(
    useInFlightToastStore.getState().exportDisk.actions?.getUpload(uploadKey)?.generation,
  );

  const [pod, loaded, watchError] = useKubevirtWatchResource<IoK8sApiCoreV1Pod>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    name: podName,
    namespace,
  });

  const progress = useUploaderProgress(loaded ? pod : undefined);

  // TODO: check if we can avoid using 3 useEffects
  useEffect(() => {
    if (watchError) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      useInFlightToastStore
        .getState()
        .exportDisk.actions?.failUpload(uploadKey, watchError.message, generationRef.current);
      useInFlightToastStore.getState().exportDisk.actions?.clearExportDiskWatchContext(uploadKey);
    }
  }, [watchError, uploadKey, cluster, namespace, pvcName, secretName]);

  useEffect(() => {
    if (
      !finishedRef.current &&
      progress.percentage !== prevPercentageRef.current &&
      progress.phase !== UploaderPhase.Idle
    ) {
      prevPercentageRef.current = progress.percentage;
      useInFlightToastStore
        .getState()
        .exportDisk.actions?.updateProgress(uploadKey, progress.percentage);
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
      useInFlightToastStore.getState().exportDisk.actions?.completeUpload(uploadKey, {
        expectedGeneration: generationRef.current,
        resourceName: podName,
        successLinks: [{ label: t('View pod logs'), url: podLogsUrl }],
      });
      useInFlightToastStore.getState().exportDisk.actions?.clearExportDiskWatchContext(uploadKey);
    }

    if (exportFailed(pod)) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      const errorMessage = getExportErrorMessage(pod, progress.errorMessage) ?? t('Unknown error');
      useInFlightToastStore
        .getState()
        .exportDisk.actions?.failUpload(uploadKey, errorMessage, generationRef.current);
      useInFlightToastStore.getState().exportDisk.actions?.clearExportDiskWatchContext(uploadKey);
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
