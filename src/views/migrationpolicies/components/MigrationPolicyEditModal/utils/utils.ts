import produce from 'immer';
import { migrationPolicySpecKeys } from 'src/views/migrationpolicies/utils/constants';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { toQuantity } from '@kubevirt-utils/utils/units';

import { getEmptyMigrationPolicy } from '../../../utils/utils';

import { EditMigrationPolicyInitialState } from './constants';

export const extractEditMigrationPolicyInitialValues = (
  mp: V1alpha1MigrationPolicy,
): EditMigrationPolicyInitialState => {
  const initState: EditMigrationPolicyInitialState = {
    migrationPolicyName: mp?.metadata?.name,
  };
  if (migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE in mp?.spec) {
    initState.allowAutoConverge = mp?.spec?.allowAutoConverge;
  }
  if (migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in mp?.spec) {
    initState.bandwidthPerMigration = toQuantity(mp?.spec?.bandwidthPerMigration);
  }
  if (migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in mp?.spec) {
    initState.completionTimeoutPerGiB = mp?.spec?.completionTimeoutPerGiB;
  }
  if (migrationPolicySpecKeys.ALLOW_POST_COPY in mp?.spec) {
    initState.allowPostCopy = mp?.spec?.allowPostCopy;
  }
  return initState;
};

export const produceUpdatedMigrationPolicy = (
  mp: V1alpha1MigrationPolicy,
  state: EditMigrationPolicyInitialState,
): V1alpha1MigrationPolicy =>
  produce<V1alpha1MigrationPolicy>(
    mp?.metadata?.name !== state?.migrationPolicyName ? getEmptyMigrationPolicy() : mp,
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

      if (mp?.metadata?.name !== state?.migrationPolicyName) {
        mpDraft.metadata.annotations[DESCRIPTION_ANNOTATION] =
          mp?.metadata?.annotations?.[DESCRIPTION_ANNOTATION];
        mpDraft.spec.selectors = { ...mp?.spec?.selectors };
      }
    },
  );
