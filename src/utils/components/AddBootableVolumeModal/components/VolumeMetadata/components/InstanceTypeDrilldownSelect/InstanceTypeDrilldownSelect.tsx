import React, { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from 'react';

import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
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
  setSelected: Dispatch<SetStateAction<string>>;
};

export const InstanceTypeDrilldownSelect: FC<InstanceTypeMenuItemsProps> = ({
  selected,
  setSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [instanceTypes] = useK8sWatchResource<V1alpha2VirtualMachineClusterInstancetype[]>({
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
  });
  const menuItems = useMemo(() => getInstanceTypeMenuItems(instanceTypes), [instanceTypes]);

  const onSelect = useCallback(
    (value: string) => {
      setSelected(value);
      setIsOpen(false);
    },
    [setSelected],
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
            setSelected={onSelect}
          />
        </DrilldownMenuItem>
        <DrilldownMenuItem {...menuItems.userProvided}>
          <UserInstanceTypeMenu
            items={menuItems.userProvided.items}
            selected={selected}
            setSelected={onSelect}
          />
        </DrilldownMenuItem>
      </ComposableDrilldownSelect>
    </FormGroup>
  );
};
