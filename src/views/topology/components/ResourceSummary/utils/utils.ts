import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export const getTolerationsPath = (obj: K8sResourceKind): string => {
  // FIXME: Is this correct for all types (jobs, cron jobs)? It would be better for the embedding page to pass in the path.
  return obj.kind === 'Pod' ? 'spec.tolerations' : 'spec.template.spec.tolerations';
};
