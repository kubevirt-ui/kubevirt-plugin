import produce from 'immer';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BinaryUnit } from '@kubevirt-utils/utils/units';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';

import { getEmptyMigrationPolicy } from '../../../../utils/utils';

export type InitialMigrationPolicyState = {
  allowAutoConverge?: boolean;
  allowPostCopy?: boolean;
  bandwidthPerMigration?: { unit: BinaryUnit; value: number };
  completionTimeoutPerGiB?: number;
  description?: string;
  migrationPolicyName: string;
  namespaceSelectorMatchLabel: { [key: string]: string };
  vmiSelectorMatchLabel: { [key: string]: string };
};

export const initialMigrationPolicyState: InitialMigrationPolicyState = {
  migrationPolicyName: generatePrettyName('policy'),
  namespaceSelectorMatchLabel: {},
  vmiSelectorMatchLabel: {},
};

export const produceMigrationPolicy = (state: InitialMigrationPolicyState) =>
  produce<V1alpha1MigrationPolicy>(
    getEmptyMigrationPolicy(),
    (mpDraft: V1alpha1MigrationPolicy) => {
      const {
        allowAutoConverge,
        allowPostCopy,
        bandwidthPerMigration,
        completionTimeoutPerGiB,
        description,
        migrationPolicyName,
        namespaceSelectorMatchLabel,
        vmiSelectorMatchLabel,
      } = state || {};

      mpDraft.metadata.name = migrationPolicyName;

      mpDraft.metadata.annotations['description'] = description ? description : null;

      mpDraft.spec.allowAutoConverge = allowAutoConverge;

      mpDraft.spec.allowPostCopy = allowPostCopy;

      mpDraft.spec.completionTimeoutPerGiB = completionTimeoutPerGiB;

      mpDraft.spec.bandwidthPerMigration =
        bandwidthPerMigration?.unit &&
        `${bandwidthPerMigration?.value}${bandwidthPerMigration?.unit}`;

      if (!isEmpty(vmiSelectorMatchLabel)) {
        mpDraft.spec.selectors.virtualMachineInstanceSelector = {
          ...vmiSelectorMatchLabel,
        };
      }

      if (!isEmpty(namespaceSelectorMatchLabel)) {
        mpDraft.spec.selectors.namespaceSelector = {
          ...namespaceSelectorMatchLabel,
        };
      }
    },
  );
