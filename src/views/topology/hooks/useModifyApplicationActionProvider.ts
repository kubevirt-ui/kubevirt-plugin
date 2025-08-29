import { useMemo } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { Action, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { getModifyApplicationAction } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GraphElement } from '@patternfly/react-topology';
import { isVMType } from '@topology/utils/utils';

type UseModifyApplicationActionProvider = (element: GraphElement) => [Action[], boolean, undefined];

const useModifyApplicationActionProvider: UseModifyApplicationActionProvider = (element) => {
  const actions = useMemo(() => {
    if (isVMType(element.getType())) return undefined;

    const resource = element?.getData()?.resources?.obj as K8sResourceCommon;
    return [getModifyApplicationAction(VirtualMachineModel, resource, 'vm-action-start')];
  }, [element]);

  return useMemo(() => {
    if (!actions) return [[], true, undefined];

    return [actions, true, undefined];
  }, [actions]);
};

export default useModifyApplicationActionProvider;
