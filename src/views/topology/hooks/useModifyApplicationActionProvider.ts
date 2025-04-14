import { useMemo } from 'react';

import {
  Action,
  getGroupVersionKindForResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { getModifyApplicationAction } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GraphElement } from '@patternfly/react-topology';

import { TYPE_VIRTUAL_MACHINE } from '../utils/constants';

type UseModifyApplicationActionProvider = (element: GraphElement) => [Action[], boolean, undefined];

const useModifyApplicationActionProvider: UseModifyApplicationActionProvider = (element) => {
  const actions = useMemo(() => {
    if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;

    const resource = element?.getData()?.resources?.obj as K8sResourceCommon;
    const model = getK8sModel(getGroupVersionKindForResource(resource));
    return [getModifyApplicationAction(model, resource, 'vm-action-start')];
  }, [element]);

  return useMemo(() => {
    if (!actions) return [[], true, undefined];

    return [actions, true, undefined];
  }, [actions]);
};

export default useModifyApplicationActionProvider;
