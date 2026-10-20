/**
 * Gallery alias for `@multicluster/hooks/useACMExtensionActions/useACMExtensionActions`.
 * Returns no ACM extension actions (avoids fleet migration menu wiring in scenes).
 */
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

/** Empty action list for VM row / wizard chrome. */
const useACMExtensionActions = (): ActionDropdownItemType[] => [];

export default useACMExtensionActions;
