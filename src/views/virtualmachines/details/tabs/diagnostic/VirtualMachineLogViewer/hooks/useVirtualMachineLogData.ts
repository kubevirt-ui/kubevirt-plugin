import { Buffer } from 'buffer';

import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

type UseVirtualMachineLogData = (args: { connect?: boolean; pod: K8sResourceCommon }) => {
  data: string[];
};

const useVirtualMachineLogData: UseVirtualMachineLogData = ({ connect = true, pod }) => {
  const [baseK8sPath, k8sAPIPathLoaded] = useFleetK8sAPIPath(getCluster(pod));
  const url = `${baseK8sPath}/api/v1/namespaces/${getNamespace(pod)}/pods/${getName(pod)}/log`;

  const socket = useWebSocket<{ object: K8sResourceCommon; type: string }>(
    k8sAPIPathLoaded
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${url}`
      : null,
    {
      onClose: () => kubevirtConsole.log('websocket closed kubevirt: ', url),
      onError: (err) => kubevirtConsole.log('Websocket error kubevirt:', err),
      onOpen: () => kubevirtConsole.log('websocket open kubevirt: ', url),
      protocols: ['base64.binary.k8s.io'],
      queryParams: {
        container: 'guest-console-log',
        follow: 'true',
      },
      retryOnError: true,
    },
    connect,
  );

  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    if (socket.lastMessage?.data) {
      const text = Buffer.from(socket.lastMessage?.data, 'base64').toString();
      const split = text.split('\n');
      setData((prevData) => {
        return [...prevData, ...split];
      });
    }

    if (!connect) setData([]);
  }, [socket.lastJsonMessage, socket.lastMessage?.data, connect]);

  return { data };
};

export default useVirtualMachineLogData;
