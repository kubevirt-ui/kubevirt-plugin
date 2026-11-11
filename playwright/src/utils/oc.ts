/**
 * @deprecated Use cluster-oc helpers via rule engine teardown rules.
 */
import { deleteLabeledE2eNamespaces } from '@/utils/cluster-oc';

export function deleteE2eNamespacesByLabel(): void {
  deleteLabeledE2eNamespaces(process.env.KUBECONFIG);
}
