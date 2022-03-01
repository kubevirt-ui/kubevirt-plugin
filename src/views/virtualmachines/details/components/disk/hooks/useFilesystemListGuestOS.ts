import * as React from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseFileSystemTableGuestOS = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, any];

const useFilesystemTableGuestOS: UseFileSystemTableGuestOS = (vmi) => {
  const [loaded, setLoaded] = React.useState(false);
  const [data, setData] = React.useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async () => {
        const response = await consoleFetch(
          `api/kubernetes/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${VirtualMachineInstanceModel.apiVersion}/namespaces/${vmi?.metadata?.namespace}/${VirtualMachineInstanceModel.plural}/${vmi?.metadata?.name}/guestosinfo`,
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
  }, [loaded, vmi]);

  return [data, loaded, error];
};

export default useFilesystemTableGuestOS;
