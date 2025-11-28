import { useMatch } from 'react-router-dom-v5-compat';

import { K8sModel, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { customModels } from './constants';

const useModelFromParam = (): [model: K8sModel | null, loading: boolean] => {
  const namespacedMatch = useMatch('/k8s/cluster/:cluster/ns/:ns/:modelRef/*');
  const clusterwideMatch = useMatch('/k8s/cluster/:cluster/:modelRef/*');

  const modelRef = namespacedMatch?.params?.modelRef || clusterwideMatch?.params?.modelRef || '';

  const [group, version, kind] = modelRef?.split('~');

  const [model, inFlight] = useK8sModel({ group, kind, version });
  const customModel = customModels[modelRef];

  if (customModel) {
    return [customModel, false];
  }

  return [model, inFlight];
};

export default useModelFromParam;
