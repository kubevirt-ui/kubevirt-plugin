import produce from 'immer';
import { migrationPolicySpecKeys } from 'src/views/migrationpolicies/utils/constants';

import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { toQuantity } from '@kubevirt-utils/utils/units';

import { getEmptyMigrationPolicy } from '../../../utils/utils';
import { type EditMigrationPolicyInitialState } from './constants';

export const extractEditMigrationPolicyInitialValues = (
  policy: V1alpha1MigrationPolicy,
): EditMigrationPolicyInitialState => {
  const initState: EditMigrationPolicyInitialState = {
    migrationPolicyName: policy?.metadata?.name,
  };
  if (migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE in policy?.spec) {
    initState.allowAutoConverge = policy?.spec?.allowAutoConverge;
  }
  if (
    migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in policy?.spec &&
    policy?.spec?.bandwidthPerMigration != null
  ) {
    initState.bandwidthPerMigration = toQuantity(policy.spec.bandwidthPerMigration.toString());
  }
  if (migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in policy?.spec) {
    initState.completionTimeoutPerGiB = policy?.spec?.completionTimeoutPerGiB;
  }
  if (migrationPolicySpecKeys.ALLOW_POST_COPY in policy?.spec) {
    initState.allowPostCopy = policy?.spec?.allowPostCopy;
  }
  return initState;
};

export const produceUpdatedMigrationPolicy = (
  policy: V1alpha1MigrationPolicy,
  state: EditMigrationPolicyInitialState,
): V1alpha1MigrationPolicy =>
  produce<V1alpha1MigrationPolicy>(
    policy?.metadata?.name !== state?.migrationPolicyName ? getEmptyMigrationPolicy() : policy,
    (mpDraft: V1alpha1MigrationPolicy) => {
      const {
        allowAutoConverge,
        allowPostCopy,
        bandwidthPerMigration,
        completionTimeoutPerGiB,
        migrationPolicyName,
      } = state || {};

      mpDraft.metadata.name = migrationPolicyName;

      mpDraft.spec.allowAutoConverge = allowAutoConverge;

      mpDraft.spec.allowPostCopy = allowPostCopy;

      mpDraft.spec.completionTimeoutPerGiB = completionTimeoutPerGiB;

      mpDraft.spec.bandwidthPerMigration =
        bandwidthPerMigration?.unit &&
        `${bandwidthPerMigration?.value}${bandwidthPerMigration?.unit}`;

      if (policy?.metadata?.name !== state?.migrationPolicyName) {
        mpDraft.metadata.annotations[DESCRIPTION_ANNOTATION] =
          policy?.metadata?.annotations?.[DESCRIPTION_ANNOTATION];
        mpDraft.spec.selectors = { ...policy?.spec?.selectors };
      }
    },
  );
