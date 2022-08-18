import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BinaryUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getEmptyMigrationPolicy } from '../../../../utils/utils';

const generateMigrationPolicyName = (): string => {
  return `policy-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

export type InitialMigrationPolicyState = {
  migrationPolicyName: string;
  vmiSelectorMatchLabel: { [key: string]: string };
  namespaceSelectorMatchLabel: { [key: string]: string };
  description?: string;
  allowAutoConverge?: boolean;
  allowPostCopy?: boolean;
  completionTimeoutPerGiB?: number;
  bandwidthPerMigration?: { value: number; unit: BinaryUnit };
};

export const initialMigrationPolicyState: InitialMigrationPolicyState = {
  migrationPolicyName: generateMigrationPolicyName(),
  vmiSelectorMatchLabel: {},
  namespaceSelectorMatchLabel: {},
};

export const produceMigrationPolicy = (state: InitialMigrationPolicyState) =>
  produce<V1alpha1MigrationPolicy>(
    getEmptyMigrationPolicy(),
    (mpDraft: V1alpha1MigrationPolicy) => {
      const {
        allowAutoConverge,
        bandwidthPerMigration,
        completionTimeoutPerGiB,
        description,
        migrationPolicyName,
        namespaceSelectorMatchLabel,
        allowPostCopy,
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
