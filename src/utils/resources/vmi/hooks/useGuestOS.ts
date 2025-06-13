import { useEffect, useState } from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

type UseGuestOS = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, Error];

export const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState(null);
  const [k8sAPIPath, k8sApiPathLoaded] = useFleetK8sAPIPath(vmi?.cluster);

  useEffect(() => {
    if (!k8sApiPathLoaded) return;

    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async () => {
        const response = await consoleFetch(
          `${k8sAPIPath}/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${VirtualMachineInstanceModel.apiVersion}/namespaces/${vmi?.metadata?.namespace}/${VirtualMachineInstanceModel.plural}/${vmi?.metadata?.name}/guestosinfo`,
        );
        const jsonData = await response.json();
        setData(jsonData);
        setLoaded(true);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [k8sAPIPath, loaded, vmi, k8sApiPathLoaded]);

  return [data, loaded, error];
};
