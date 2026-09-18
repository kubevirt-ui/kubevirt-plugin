import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { type K8sModel, type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

type BulkNamespaceScope = {
  cluster: string;
  namespace: string;
};

export const getBulkNamespaceScopes = (vms: V1VirtualMachine[]): BulkNamespaceScope[] => {
  const seen = new Set<string>();

  return (vms ?? []).reduce<BulkNamespaceScope[]>((acc, vm) => {
    const namespace = getNamespace(vm);
    if (!namespace) {
      return acc;
    }

    const cluster = getCluster(vm) ?? '';
    const scopeKey = `${cluster}/${namespace}`;
    if (seen.has(scopeKey)) {
      return acc;
    }

    seen.add(scopeKey);
    acc.push({ cluster, namespace });
    return acc;
  }, []);
};

export const asNamespaceAccessReview = (
  model: K8sModel,
  scope: BulkNamespaceScope,
  verb: K8sVerb,
  subresource?: string,
): FleetAccessReviewResourceAttributes => ({
  cluster: scope.cluster,
  group: model.apiGroup,
  namespace: scope.namespace,
  resource: model.plural,
  subresource,
  verb,
});

export const asBulkAccessReview = (
  model: K8sModel,
  vms: V1VirtualMachine[],
  verb: K8sVerb,
  subresource?: string,
): FleetAccessReviewResourceAttributes | undefined => {
  const scopes = getBulkNamespaceScopes(vms);

  if (scopes.length !== 1) {
    return undefined;
  }

  return asNamespaceAccessReview(model, scopes[0], verb, subresource);
};
