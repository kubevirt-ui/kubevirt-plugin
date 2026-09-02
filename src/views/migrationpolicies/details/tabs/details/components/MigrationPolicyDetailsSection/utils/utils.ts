import produce from 'immer';

import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const ensureMigrationPolicyMatchLabels = (
  migrationPolicy: V1alpha1MigrationPolicy,
  labels: { [key: string]: string },
  selector: string,
): V1alpha1MigrationPolicy =>
  produce<V1alpha1MigrationPolicy>(migrationPolicy, (mpDraft: V1alpha1MigrationPolicy) => {
    mpDraft.spec.selectors[selector] = { ...labels };
  });
