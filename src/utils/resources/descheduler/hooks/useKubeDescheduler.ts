import { KubeDeschedulerModel } from '@kubevirt-ui/kubevirt-api/console';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { KubeDescheduler } from '@kubevirt-utils/resources/descheduler/types';
import { defaultDescheduler } from '@kubevirt-utils/resources/descheduler/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseKubeDescheduler = () => {
  descheduler: KubeDescheduler;
  deschedulerLoaded: boolean;
  deschedulerLoadError: boolean;
};

const useKubeDescheduler: UseKubeDescheduler = () => {
  const [descheduler, deschedulerLoaded, deschedulerLoadError] =
    useK8sWatchResource<KubeDescheduler>({
      groupVersionKind: modelToGroupVersionKind(KubeDeschedulerModel),
      name: defaultDescheduler.metadata.name,
      namespace: defaultDescheduler.metadata.namespace,
    });

  return { descheduler, deschedulerLoaded, deschedulerLoadError };
};

export default useKubeDescheduler;
