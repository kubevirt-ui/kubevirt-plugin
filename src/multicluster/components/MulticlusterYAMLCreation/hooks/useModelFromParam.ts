import { useMatch } from 'react-router-dom-v5-compat';

import { FLEET_BASE_PATH } from '@multicluster/constants';
import { K8sModel, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { customModels } from './constants';

const useModelFromParam = (): [model: K8sModel | null, loading: boolean] => {
  const pageMatch = useMatch(`${FLEET_BASE_PATH}/:page/*`);
  const modelRef = pageMatch?.params?.page || '';

  const [group, version, kind] = modelRef.split('~');

  const [model, inFlight] = useK8sModel({ group, kind, version });
  const customModel = customModels[modelRef];

  if (customModel) {
    return [customModel, false];
  }

  return [model, inFlight];
};

export default useModelFromParam;
