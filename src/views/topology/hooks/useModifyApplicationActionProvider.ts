import { useMemo } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { Action, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useGetModifyApplicationAction } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GraphElement } from '@patternfly/react-topology';
import { isVMType } from '@topology/utils/utils';

type UseModifyApplicationActionProvider = (element: GraphElement) => [Action[], boolean, undefined];

const useModifyApplicationActionProvider: UseModifyApplicationActionProvider = (element) => {
  const isVMElement = useMemo(() => isVMType(element.getType()), [element]);

  const resource = useMemo<K8sResourceCommon>(
    () => (isVMElement ? element.getData()?.resources?.obj : undefined),
    [element, isVMElement],
  );

  const editApplicationAction = useGetModifyApplicationAction(
    VirtualMachineModel,
    resource,
    'vm-action-start',
  );

  const actions = useMemo(
    () => (isVMElement ? [editApplicationAction] : []),
    [isVMElement, editApplicationAction],
  );

  return useMemo(() => [actions, true, undefined], [actions]);
};

export default useModifyApplicationActionProvider;
