import { MigPlan } from '@kubevirt-utils/resources/migrations/constants';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

const useStorageMigrationFilters = (): RowFilter<MigPlan>[] => {
  return [];
};

export default useStorageMigrationFilters;
