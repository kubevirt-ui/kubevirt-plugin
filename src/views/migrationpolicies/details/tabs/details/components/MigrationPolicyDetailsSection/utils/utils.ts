import produce from 'immer';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const ensureMigrationPolicyMatchLabels = (
  mp: V1alpha1MigrationPolicy,
  labels: { [key: string]: string },
  selector: string,
) =>
  produce<V1alpha1MigrationPolicy>(mp, (mpDraft: V1alpha1MigrationPolicy) => {
    mpDraft.spec.selectors[selector] = { ...labels };
  });
