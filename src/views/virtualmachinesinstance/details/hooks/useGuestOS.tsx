import * as React from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isGuestAgentConnected, vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseGuestOS = (
  vmi: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, any, boolean];

const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = React.useState(false);
  const [data, setData] = React.useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = React.useState(null);
  const isGuestAgent = isGuestAgentConnected(vmi);

  React.useEffect(() => {
    setError(null);
    const namespace = vmi?.metadata?.namespace;
    const name = vmi?.metadata?.name;

    if (vmi?.status?.phase === vmiStatuses.Running && isGuestAgent) {
      (async () => {
        const response = await consoleFetch(
          `api/kubernetes/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${VirtualMachineInstanceModel.apiVersion}/namespaces/${namespace}/${VirtualMachineInstanceModel.plural}/${name}/guestosinfo`,
        );
        const jsonData = await response.json();
        setData(jsonData);
        setLoaded(true);
        setError(null);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [vmi, isGuestAgent]);

  return [data, loaded, error, isGuestAgent];
};

export default useGuestOS;
