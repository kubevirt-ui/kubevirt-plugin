import { useEffect, useMemo, useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineFromJSON } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { isInstanceTypeVM } from '../utils/instanceTypes';

type UseInstanceTypeExpandSpec = (
  vm: V1VirtualMachine,
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

  useEffect(() => {
    const fetch = async () => {
      const url = `api/kubernetes/apis/subresources.${VirtualMachineModel.apiGroup}/${
        VirtualMachineModel.apiVersion
      }/namespaces/${getNamespace(innerVM)}/${VirtualMachineModel.plural}/${getName(
        innerVM,
      )}/expand-spec`;

      setLoadingExpandedSpec(true);
      try {
        const response = await consoleFetch(url);
        const json = await response.json();
        const expandedVm = V1VirtualMachineFromJSON(json);
        expandedVm.spec = {
          ...expandedVm.spec,
          // re-establish the reference to the instance type
          // expand-spec removes it as the output should allow creating an independent VM
          instancetype: innerVM.spec.instancetype,
          preference: innerVM.spec.preference,
        };

        setInstanceTypeExpandedSpec(expandedVm);
      } catch (err) {
        kubevirtConsole.log(err.message);
        setErrorExpandedSpec(err);
      } finally {
        setLoadingExpandedSpec(false);
      }
    };
    !isEmpty(innerVM) && isInstanceType && fetch();
  }, [innerVM, isInstanceType]);

  return [instanceTypeExpandedSpec, loadingExpandedSpec, errorExpandedSpec];
};

export default useInstanceTypeExpandSpec;
