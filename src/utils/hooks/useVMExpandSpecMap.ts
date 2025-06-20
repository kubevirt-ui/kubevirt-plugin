import { useEffect, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getInstanceTypeExpandSpecURL,
  isInstanceTypeVM,
} from '@kubevirt-utils/resources/instancetype/helper';
import { NamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

const useVMExpandSpecMap = (vms: V1VirtualMachine[]) => {
  const [vmExpandSpecMap, setVMExpandSpecMap] = useState<NamespacedResourceMap<V1VirtualMachine>>(
    {},
  );

  useEffect(() => {
    const tempMap = {};

    const fetchPromises = vms.map(async (vm) => {
      if (isInstanceTypeVM(vm)) {
        const name = vm?.metadata?.name;
        const namespace = vm?.metadata?.namespace;

        if (!tempMap[namespace]) {
          tempMap[namespace] = {};
        }

        const url = getInstanceTypeExpandSpecURL(vm);
        try {
          const response = await consoleFetch(url);
          const json = await response.json();
          tempMap[namespace][name] = json;
        } catch {}
      }
    });

    Promise.all(fetchPromises).then(() => {
      setVMExpandSpecMap(tempMap);
    });
  }, [vms]);

  return vmExpandSpecMap;
};

export default useVMExpandSpecMap;
