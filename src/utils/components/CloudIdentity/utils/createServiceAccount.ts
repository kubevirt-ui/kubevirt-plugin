import { ServiceAccountModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { buildServiceAccount } from './serviceAccount';

type CreateServiceAccountParams = {
  cluster?: string;
  namespace: string;
  provider: CloudIdentityProvider;
  values: CloudIdentityFormValues;
};

export const createServiceAccount = ({
  cluster,
  namespace,
  provider,
  values,
}: CreateServiceAccountParams): Promise<IoK8sApiCoreV1ServiceAccount> =>
  kubevirtK8sCreate<IoK8sApiCoreV1ServiceAccount>({
    cluster,
    data: buildServiceAccount({ namespace, provider, values }),
    model: ServiceAccountModel,
  });
