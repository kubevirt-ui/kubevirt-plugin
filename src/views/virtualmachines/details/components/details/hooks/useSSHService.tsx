import * as React from 'react';

import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseSSHServiceProps = (vmi: V1VirtualMachineInstance) => {
  sshService: any;
};

const useSSHService: UseSSHServiceProps = (vmi: V1VirtualMachineInstance) => {
  const [sshService, setSSHService] = React.useState<any>(undefined);
  const sshServiceModal = React.useMemo(
    () => ({
      kind: ServiceModel.kind,
      isList: true,
      namespace: vmi?.metadata?.namespace,
    }),
    [vmi],
  );

  const [services, isServicesLoaded] = useK8sWatchResource<K8sResourceCommon[]>(sshServiceModal);

  React.useEffect(() => {
    if (vmi?.metadata?.name && isServicesLoaded) {
      const service = services?.find(
        ({ metadata: serviceMetadata }) =>
          serviceMetadata?.name === `${vmi?.metadata?.name}-ssh-service`,
      );
      if (service) {
        setSSHService(service);
      }
    }
  }, [vmi, services, isServicesLoaded]);

  return { sshService };
};

export default useSSHService;
