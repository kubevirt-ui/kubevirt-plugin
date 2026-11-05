import { type FC, useEffect, useRef } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type ExportDiskContext } from '@kubevirt-utils/hooks/useInFlightToast/features/exportDisk/types/types';
import { getExportDiskUploadKey } from '@kubevirt-utils/hooks/useInFlightToast/keys/uploadKeys';
import { getExportDiskActions } from '@kubevirt-utils/hooks/useInFlightToast/shared/selectors/inFlightToastStoreSelectors';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { UploaderPhase } from '../../../../../components/ExportModal/hooks/types';
import useUploaderProgress from '../../../../../components/ExportModal/hooks/useUploaderProgress';
import {
  exportFailed,
  exportSucceeded,
  getExportErrorMessage,
} from '../../../../../components/ExportModal/utils/utils';

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
  const generationRef = useRef(getExportDiskActions()?.getUpload(uploadKey)?.generation);

  const [pod, loaded, watchError] = useKubevirtWatchResource<IoK8sApiCoreV1Pod>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    name: podName,
    namespace,
  });

  const progress = useUploaderProgress(loaded ? pod : undefined);

  useEffect(() => {
    if (finishedRef.current) return;

    const actions = getExportDiskActions();

    if (watchError) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      actions?.failUpload(uploadKey, watchError.message, generationRef.current);
      actions?.clearExportDiskWatchContext(uploadKey);
      return;
    }

    if (!loaded) return;

    if (exportSucceeded(pod)) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      const podLogsUrl = `${getResourceUrl({ model: PodModel, resource: pod })}/logs`;
      actions?.completeUpload(uploadKey, {
        expectedGeneration: generationRef.current,
        resourceName: podName,
        successLinks: [{ label: t('View pod logs'), url: podLogsUrl }],
      });
      actions?.clearExportDiskWatchContext(uploadKey);
      return;
    }

    if (exportFailed(pod)) {
      finishedRef.current = true;
      deleteSecret(cluster, namespace, secretName);
      const errorMessage = getExportErrorMessage(pod, progress.errorMessage) ?? t('Unknown error');
      actions?.failUpload(uploadKey, errorMessage, generationRef.current);
      actions?.clearExportDiskWatchContext(uploadKey);
      return;
    }

    if (
      progress.percentage !== prevPercentageRef.current &&
      progress.phase !== UploaderPhase.Idle
    ) {
      prevPercentageRef.current = progress.percentage;
      actions?.updateProgress(uploadKey, progress.percentage);
    }
  }, [
    watchError,
    pod,
    loaded,
    progress.percentage,
    progress.phase,
    progress.errorMessage,
    uploadKey,
    cluster,
    namespace,
    podName,
    pvcName,
    secretName,
    t,
  ]);

  return null;
};

export default ExportUploadWatcherEntry;
