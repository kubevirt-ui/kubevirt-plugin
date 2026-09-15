import { useCallback, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type {
  LOAD_BALANCER_ENABLED,
  NODE_PORT_ADDRESS,
  NODE_PORT_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { FEATURES_CONFIG_MAP_NAME } from '@kubevirt-utils/hooks/useFeatures/constants';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

type SSHConfigurationField =
  | typeof LOAD_BALANCER_ENABLED
  | typeof NODE_PORT_ADDRESS
  | typeof NODE_PORT_ENABLED;

type UseUpdateSSHConfiguration = {
  isLoading: boolean;
  updateSSHConfiguration: (value: string) => Promise<void>;
};

const useUpdateSSHConfiguration = (field: SSHConfigurationField): UseUpdateSSHConfiguration => {
  const [isLoading, setIsLoading] = useState(false);
  const cluster = useSettingsCluster();
  const operatorNamespace = operatorNamespaceSignal.value;

  const updateSSHConfiguration = useCallback(
    async (value: string): Promise<void> => {
      if (!operatorNamespace) return;

      setIsLoading(true);

      try {
        await kubevirtK8sPatch({
          cluster,
          data: [{ op: 'replace', path: `/data/${field}`, value }],
          model: ConfigMapModel,
          resource: {
            metadata: {
              name: FEATURES_CONFIG_MAP_NAME,
              namespace: operatorNamespace,
            },
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [cluster, field, operatorNamespace],
  );

  return { isLoading, updateSSHConfiguration };
};

export default useUpdateSSHConfiguration;
