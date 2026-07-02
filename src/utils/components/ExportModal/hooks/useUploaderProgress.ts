import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';

import { UPLOADER_CONTAINER_NAME } from '../constants';
import {
  buildPodLogWsUrl,
  exportFailed,
  exportSucceeded,
  processUploaderMessage,
  shouldConnectToUploader,
} from '../utils';

import { initialProgress } from './parseUploaderLog';
import { UploaderPhase, type UploaderProgress } from './types';

const useUploaderProgress = (pod: IoK8sApiCoreV1Pod | undefined): UploaderProgress => {
  const [progress, setProgress] = useState<UploaderProgress>(initialProgress);
  const progressRef = useRef(initialProgress);

  const shouldConnect = shouldConnectToUploader(pod);

  const [baseK8sPath, k8sAPIPathLoaded] = useK8sBaseAPIPath(getCluster(pod));

  const podName = getName(pod);
  const podNamespace = getNamespace(pod);

  const wsUrl =
    k8sAPIPathLoaded && shouldConnect ? buildPodLogWsUrl(baseK8sPath, podNamespace, podName) : null;

  const socket = useWebSocket(wsUrl, {
    onClose: () => kubevirtConsole.log('disk-uploader log stream closed'),
    onError: (err) => kubevirtConsole.log('disk-uploader log stream error:', err),
    onOpen: () => kubevirtConsole.log('disk-uploader log stream open'),
    protocols: ['base64.binary.k8s.io'],
    queryParams: {
      container: UPLOADER_CONTAINER_NAME,
      follow: 'true',
    },
    retryOnError: true,
  });

  useEffect(() => {
    if (!socket.lastMessage?.data) return;

    const updated = processUploaderMessage(socket.lastMessage.data, progressRef.current);

    if (updated !== progressRef.current) {
      progressRef.current = updated;
      setProgress(updated);
    }
  }, [socket.lastMessage]);

  useEffect(() => {
    if (exportSucceeded(pod) && progress.phase !== UploaderPhase.Done) {
      const done = { ...progressRef.current, percentage: 100, phase: UploaderPhase.Done };
      progressRef.current = done;
      setProgress(done);
    }
    if (exportFailed(pod) && progress.phase !== UploaderPhase.Error) {
      const error = { ...progressRef.current, phase: UploaderPhase.Error };
      progressRef.current = error;
      setProgress(error);
    }
  }, [pod, progress.phase]);

  return progress;
};

export default useUploaderProgress;
