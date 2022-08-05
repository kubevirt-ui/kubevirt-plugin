import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BinaryUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getEmptyMigrationPolicy = (): V1alpha1MigrationPolicy => ({
  apiVersion: 'migrations.kubevirt.io/v1alpha1',
  kind: 'MigrationPolicy',
  metadata: { annotations: {} },
  spec: { selectors: {} },
});

const generateMigrationPolicyName = (): string => {
  return `policy-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

export type InitialMigrationPolicyState = {
  migrationPolicyName: string;
  description: string;
  autoConverge: boolean;
  postCopy: boolean;
  completionTimeout: { enabled: boolean; value: number };
  bandwidthPerMigration: { value: number; unit: BinaryUnit };
  vmiSelectorMatchLabel: { [key: string]: string };
  namespaceSelectorMatchLabel: { [key: string]: string };
};

export const initialMigrationPolicyState: InitialMigrationPolicyState = {
  migrationPolicyName: generateMigrationPolicyName(),
  description: null,
  autoConverge: false,
  postCopy: false,
  completionTimeout: { enabled: false, value: 0 },
  bandwidthPerMigration: { value: 0, unit: BinaryUnit.Mi },
  vmiSelectorMatchLabel: {},
  namespaceSelectorMatchLabel: {},
};

export const produceUpdatedMigrationPolicy = (state: InitialMigrationPolicyState) =>
  produce<V1alpha1MigrationPolicy>(
    getEmptyMigrationPolicy(),
    (mpDraft: V1alpha1MigrationPolicy) => {
      const {
        autoConverge,
        bandwidthPerMigration,
        completionTimeout,
        description,
        migrationPolicyName,
        namespaceSelectorMatchLabel,
        postCopy,
        vmiSelectorMatchLabel,
      } = state || {};

      mpDraft.metadata.name = migrationPolicyName;

      mpDraft.metadata.annotations['description'] = description ? description : null;

      mpDraft.spec.allowAutoConverge = autoConverge;

      mpDraft.spec.allowPostCopy = postCopy;

      mpDraft.spec.completionTimeoutPerGiB = completionTimeout?.enabled
        ? completionTimeout?.value
        : null;

      mpDraft.spec.bandwidthPerMigration =
        bandwidthPerMigration?.value &&
        `${bandwidthPerMigration?.value}${bandwidthPerMigration?.unit}`;

      if (!isEmpty(vmiSelectorMatchLabel)) {
        mpDraft.spec.selectors.virtualMachineInstanceSelector = {
          matchLabels: { ...vmiSelectorMatchLabel },
        };
      }

      if (!isEmpty(namespaceSelectorMatchLabel)) {
        mpDraft.spec.selectors.namespaceSelector = {
          matchLabels: { ...namespaceSelectorMatchLabel },
        };
      }
    },
  );
