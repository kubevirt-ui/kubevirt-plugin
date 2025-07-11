import { useEffect, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useInstanceTypeSpecURL from '@multicluster/hooks/useInstanceTypeSpecURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseInstanceTypeExpandSpec = (
  vm?: V1VirtualMachine,
) => [
  instanceTypeExpandedSpec: V1VirtualMachine,
  loadingExpandedSpec: boolean,
  errorExpandedSpec: Error,
];
const useInstanceTypeExpandSpec: UseInstanceTypeExpandSpec = (vm) => {
  const [instanceTypeExpandedSpec, setInstanceTypeExpandedSpec] = useState<V1VirtualMachine>();
  const [loadingExpandedSpec, setLoadingExpandedSpec] = useState<boolean>();
  const [errorExpandedSpec, setErrorExpandedSpec] = useState<Error>();
  const isInstanceType = useMemo(() => isInstanceTypeVM(vm), [vm]);
  const innerVM = useDeepCompareMemoize(vm);
  const name = getName(innerVM);
  const namespace = getNamespace(innerVM);
  const [url, urlLoaded] = useInstanceTypeSpecURL(innerVM);

  useEffect(() => {
    if (!urlLoaded) {
      return;
    }

    const fetch = async () => {
      setLoadingExpandedSpec(true);
      try {
        const response = await consoleFetch(url);
        const json = await response.json();
        setInstanceTypeExpandedSpec(json);
      } catch (err) {
        kubevirtConsole.log(err.message);
        setErrorExpandedSpec(err);
      } finally {
        setLoadingExpandedSpec(false);
      }
    };
    !isEmpty(innerVM) && isInstanceType && fetch();
  }, [namespace, name, isInstanceType, url, urlLoaded, innerVM]);

  return [instanceTypeExpandedSpec, loadingExpandedSpec, errorExpandedSpec];
};

export default useInstanceTypeExpandSpec;
