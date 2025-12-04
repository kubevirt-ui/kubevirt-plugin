import { useMemo } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { Action, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useGetModifyApplicationAction } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GraphElement } from '@patternfly/react-topology';
import { isVMType } from '@topology/utils/utils';

type UseModifyApplicationActionProvider = (element: GraphElement) => [Action[], boolean, undefined];

const useModifyApplicationActionProvider: UseModifyApplicationActionProvider = (element) => {
  const isVMElement = useMemo(() => isVMType(element.getType()), [element]);

  const resource = useMemo<K8sResourceCommon>(
    () => (isVMElement ? undefined : element.getData()?.resources?.obj),
    [element, isVMElement],
  );

  const startAction = useGetModifyApplicationAction(
    VirtualMachineModel,
    resource,
    'vm-action-start',
  );

  const actions = useMemo(() => (isVMElement ? [] : [startAction]), [isVMElement, startAction]);

  return useMemo(() => [actions, true, undefined], [actions]);
};

export default useModifyApplicationActionProvider;
