import { KubeDeschedulerModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { type KubeDescheduler } from '@kubevirt-utils/resources/descheduler/types';
import { defaultDescheduler } from '@kubevirt-utils/resources/descheduler/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseKubeDeschedulerOptions = {
  cluster?: string;
  enabled?: boolean;
};

type UseKubeDeschedulerResult = {
  descheduler: KubeDescheduler | undefined;
  deschedulerError: Error;
  deschedulerLoaded: boolean;
};

const useKubeDescheduler = ({
  cluster,
  enabled = true,
}: UseKubeDeschedulerOptions = {}): UseKubeDeschedulerResult => {
  const clusterParam = useClusterParam();
  const [descheduler, deschedulerLoaded, deschedulerError] = useK8sWatchData<KubeDescheduler>(
    enabled
      ? {
          cluster: cluster ?? clusterParam,
          groupVersionKind: modelToGroupVersionKind(KubeDeschedulerModel),
          name: defaultDescheduler.metadata.name,
          namespace: defaultDescheduler.metadata.namespace,
        }
      : null,
  );

  return { descheduler, deschedulerError, deschedulerLoaded };
};

export default useKubeDescheduler;
