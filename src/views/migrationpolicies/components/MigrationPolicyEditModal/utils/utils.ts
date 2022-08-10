import produce from 'immer';

import { bytesFromQuantity } from '@catalog/utils/quantity';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { BinaryUnit } from '@kubevirt-utils/utils/units';

import { getEmptyMigrationPolicy } from '../../../utils/utils';

import { EditMigrationPolicyInitialState } from './constants';

export const fromIECUnit = (unit: string): BinaryUnit => {
  const newUnit = unit?.endsWith('B') ? (unit.slice(0, -1) as BinaryUnit) : (unit as BinaryUnit);
  return newUnit;
};

export const extractEditMigrationPolicyInitialValues = (
  mp: V1alpha1MigrationPolicy,
): EditMigrationPolicyInitialState => {
  const [value, unit] = bytesFromQuantity(mp?.spec?.bandwidthPerMigration);
  return {
    autoConverge: mp?.spec?.allowAutoConverge,
    bandwidthPerMigration: {
      unit: fromIECUnit(unit),
      value,
    },
    completionTimeout: {
      value: mp?.spec?.completionTimeoutPerGiB ?? 0,
      enabled: !!mp?.spec?.completionTimeoutPerGiB,
    },
    postCopy: mp?.spec?.allowPostCopy,
    migrationPolicyName: mp?.metadata?.name,
  };
};

export const produceUpdatedMigrationPolicy = (
  mp: V1alpha1MigrationPolicy,
  state: EditMigrationPolicyInitialState,
): V1alpha1MigrationPolicy =>
  produce<V1alpha1MigrationPolicy>(
    mp?.metadata?.name !== state?.migrationPolicyName ? getEmptyMigrationPolicy() : mp,
    (mpDraft: V1alpha1MigrationPolicy) => {
      const {
        autoConverge,
        bandwidthPerMigration,
        completionTimeout,
        migrationPolicyName,
        postCopy,
      } = state || {};

      mpDraft.metadata.name = migrationPolicyName;

      mpDraft.spec.allowAutoConverge = autoConverge;

      mpDraft.spec.allowPostCopy = postCopy;

      mpDraft.spec.completionTimeoutPerGiB = completionTimeout?.enabled
        ? completionTimeout?.value
        : null;

      mpDraft.spec.bandwidthPerMigration =
        bandwidthPerMigration?.value &&
        `${bandwidthPerMigration?.value}${bandwidthPerMigration?.unit}`;

      if (mp?.metadata?.name !== state?.migrationPolicyName) {
        mpDraft.metadata.annotations[DESCRIPTION_ANNOTATION] =
          mp?.metadata?.annotations?.[DESCRIPTION_ANNOTATION];
        mpDraft.spec.selectors = { ...mp?.spec?.selectors };
      }
    },
  );
