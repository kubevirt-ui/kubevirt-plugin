import { useMatch } from 'react-router';

import { FLEET_BASE_PATH } from '@multicluster/constants';
import { type K8sModel, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { customModels } from './constants';

const useModelFromParam = (): [model: K8sModel | null, loading: boolean] => {
  const pageMatch = useMatch(`${FLEET_BASE_PATH}/:page/*`);
  const modelRef = pageMatch?.params?.page ?? '';

  const [group, version, kind] = modelRef.split('~');

  const [model, inFlight] = useK8sModel({ group, kind, version });
  const customModel =
    modelRef in customModels ? customModels[modelRef as keyof typeof customModels] : undefined;

  if (customModel) {
    return [customModel, false];
  }

  return [model, inFlight];
};

export default useModelFromParam;
