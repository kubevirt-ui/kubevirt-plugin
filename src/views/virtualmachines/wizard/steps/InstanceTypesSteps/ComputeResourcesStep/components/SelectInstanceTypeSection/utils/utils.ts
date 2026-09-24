import { type InstanceTypesMenuItemsData } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { type InstanceTypeSelection } from '@virtualmachines/wizard/state/vm-wizard-form/types';

import { TabKey } from './constants';

export { categoryDetailsMap } from './categoryDetails';

export const getActiveTabKey = (
  selectedInstanceType: InstanceTypeSelection,
  menuItems: InstanceTypesMenuItemsData,
): TabKey => {
  const namespace = selectedInstanceType?.type === 'user' ? selectedInstanceType.namespace : null;

  const isUserProvidedSelection =
    Boolean(namespace) ||
    (!namespace && menuItems.userProvided.items.includes(selectedInstanceType?.name));

  return isUserProvidedSelection ? TabKey.Users : TabKey.RedHat;
};
