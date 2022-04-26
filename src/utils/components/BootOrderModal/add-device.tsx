import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableDeviceType } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';

import { AddDeviceButton } from './add-device-button';
import { AddDeviceFormSelect } from './add-device-form-select';

export const AddDevice = ({ devices, onAdd, isEditMode, setEditMode }: AddDeviceProps) => {
  const { t } = useKubevirtTranslation();
  const options = devices.filter((device) => !device.value.bootOrder);

  const canAddItem = options.length > 0;
  const selectID = 'add-device-select';
  const buttontID = 'add-device-btn';

  return (
    <div className="kubevirt-boot-order__add-device">
      {isEditMode && canAddItem ? (
        <AddDeviceFormSelect
          id={selectID}
          options={options}
          label={t('Please select a boot source')}
          onAdd={onAdd}
          onDelete={() => setEditMode(false)}
        />
      ) : (
        <AddDeviceButton
          id={buttontID}
          message={t('Add source')}
          disabledMessage={t('All sources selected')}
          isDisabled={!canAddItem}
          onClick={() => setEditMode(true)}
        />
      )}
    </div>
  );
};

export type AddDeviceProps = {
  devices: BootableDeviceType[];
  isEditMode: boolean;
  /** onAdd moves items from the options list to the sources list, key = "<type>-<name>". */
  onAdd: (key: string) => void;
  setEditMode: (boolean) => void;
};
