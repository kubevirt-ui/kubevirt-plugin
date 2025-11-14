import { FLAG_STORAGE_MIGRATION_ENABLED } from '@kubevirt-utils/flags/consts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';

const useIsMTCInstalled = () => {
  return useFlag(FLAG_STORAGE_MIGRATION_ENABLED);
};

export default useIsMTCInstalled;
