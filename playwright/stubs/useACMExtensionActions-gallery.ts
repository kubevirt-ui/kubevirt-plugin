import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

/** Gallery: skip ACM VM action extensions (empty `useResolvedExtensions` breaks cross-cluster migration lookup). */
const useACMExtensionActions = (): ActionDropdownItemType[] => [];

export default useACMExtensionActions;
