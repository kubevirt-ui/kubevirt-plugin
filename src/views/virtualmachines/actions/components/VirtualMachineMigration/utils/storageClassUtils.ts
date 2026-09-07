import { getPVCStorageClassName } from '@kubevirt-utils/resources/bootableresources/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { type SelectedMigration } from './constants';

export const getVmStorageClassNames = (
  selectedMigrations: null | SelectedMigration[],
  defaultStorageClassName: string,
): (string | undefined)[] =>
  Array.from(
    new Set(
      selectedMigrations?.map(
        (migration) => getPVCStorageClassName(migration.pvc) ?? defaultStorageClassName,
      ),
    ),
  );

export const getIsSameStorageClass = (
  destinationStorageClass: string,
  vmStorageClassNames: (string | undefined)[],
): boolean =>
  !!destinationStorageClass &&
  !isEmpty(vmStorageClassNames) &&
  vmStorageClassNames.every((storageClassName) => storageClassName === destinationStorageClass);
