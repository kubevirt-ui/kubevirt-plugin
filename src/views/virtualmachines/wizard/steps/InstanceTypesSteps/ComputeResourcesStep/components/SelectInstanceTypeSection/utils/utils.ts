import { type InstanceTypesMenuItemsData } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { type SelectedInstanceType } from '@virtualmachines/wizard/state/vm-wizard-form/types';

import { TabKey } from './constants';

export { categoryDetailsMap } from './categoryDetails';

export const getActiveTabKey = (
  selectedInstanceType: SelectedInstanceType,
  menuItems: InstanceTypesMenuItemsData,
): TabKey => {
  const isUserProvidedSelection =
    Boolean(selectedInstanceType?.namespace) ||
    (!selectedInstanceType?.namespace &&
      menuItems.userProvided.items.includes(selectedInstanceType?.name));

  return isUserProvidedSelection ? TabKey.Users : TabKey.RedHat;
};
