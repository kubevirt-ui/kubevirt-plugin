import React, { FC, useCallback, useMemo, useState } from 'react';

import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';
import { DEFAULT_INSTANCETYPE_KIND_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import ComposableDrilldownSelect from './components/ComposableDrilldownSelect/ComposableDrilldownSelect';
import DrilldownMenuItem from './components/DrilldownMenuItem/DrilldownMenuItem';
import RedHatInstanceTypeSeriesMenu from './components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesMenu';
import SelectInstanceTypeToggle from './components/SelectInstanceTypeToggle/SelectInstanceTypeToggle';
import UserInstanceTypeMenu from './components/UserInstanceTypeMenu/UserInstanceTypeMenu';
import { MENUS } from './utils/constants';
import { getInstanceTypeMenuItems } from './utils/utils';

type InstanceTypeMenuItemsProps = {
  selected: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
  setSelected: (value: string) => void;
};

export const InstanceTypeDrilldownSelect: FC<InstanceTypeMenuItemsProps> = ({
  selected,
  setBootableVolumeField,
  setSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { allInstanceTypes } = useInstanceTypesAndPreferences();
  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

  const onSelect = useCallback(
    (kind: string) => (value: string) => {
      setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_KIND_LABEL)(kind);
      setSelected(value);
      setIsOpen(false);
    },
    [setBootableVolumeField, setSelected],
  );

  return (
    <FormGroup
      label={
        <>
          {t('Default InstanceType')}{' '}
          <HelpTextIcon
            bodyContent={t('The default InstanceType for this volume.')}
            position={PopoverPosition.right}
          />
        </>
      }
    >
      <ComposableDrilldownSelect
        id={MENUS.root}
        isOpen={isOpen}
        scrollableMenuIDs={[MENUS.userProvided]}
        setIsOpen={setIsOpen}
        toggleLabel={<SelectInstanceTypeToggle selected={selected} />}
      >
        <DrilldownMenuItem {...menuItems.redHatProvided}>
          <RedHatInstanceTypeSeriesMenu
            selected={selected}
            series={menuItems.redHatProvided.items}
            setSelected={onSelect(VirtualMachineClusterInstancetypeModel.kind)}
          />
        </DrilldownMenuItem>
        <DrilldownMenuItem {...menuItems.userProvided}>
          <UserInstanceTypeMenu
            allInstanceTypes={allInstanceTypes}
            selected={selected}
            setSelected={onSelect(VirtualMachineInstancetypeModel.kind)}
          />
        </DrilldownMenuItem>
      </ComposableDrilldownSelect>
    </FormGroup>
  );
};
