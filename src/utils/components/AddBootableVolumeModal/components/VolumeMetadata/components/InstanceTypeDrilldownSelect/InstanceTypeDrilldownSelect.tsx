import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';
import {
  DEFAULT_INSTANCETYPE_KIND_LABEL,
  DEFAULT_INSTANCETYPE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, PopoverPosition } from '@patternfly/react-core';

import ComposableDrilldownSelect from './components/ComposableDrilldownSelect/ComposableDrilldownSelect';
import DrilldownMenuItem from './components/DrilldownMenuItem/DrilldownMenuItem';
import RedHatInstanceTypeSeriesMenu from './components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesMenu';
import SelectInstanceTypeToggle from './components/SelectInstanceTypeToggle/SelectInstanceTypeToggle';
import UserInstanceTypeMenu from './components/UserInstanceTypeMenu/UserInstanceTypeMenu';
import { MENUS } from './utils/constants';
import { getInstanceTypeMenuItems, isExistingInstanceType } from './utils/utils';

type InstanceTypeMenuItemsProps = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

export const InstanceTypeDrilldownSelect: FC<InstanceTypeMenuItemsProps> = ({
  bootableVolume,
  deleteLabel,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { bootableVolumeCluster, bootableVolumeNamespace, labels } = bootableVolume;
  const { allInstanceTypes } = useInstanceTypesAndPreferences(
    bootableVolumeNamespace,
    bootableVolumeCluster,
  );
  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

  const selectedInstanceType = labels?.[DEFAULT_INSTANCETYPE_LABEL];
  const selectedInstanceTypeKind = labels?.[DEFAULT_INSTANCETYPE_KIND_LABEL];

  const isExistingOption = useMemo(
    () => isExistingInstanceType(allInstanceTypes, selectedInstanceType, selectedInstanceTypeKind),
    [allInstanceTypes, selectedInstanceType, selectedInstanceTypeKind],
  );

  useEffect(() => {
    if (!isExistingOption) {
      deleteLabel(DEFAULT_INSTANCETYPE_LABEL);
      deleteLabel(DEFAULT_INSTANCETYPE_KIND_LABEL);
    }
  }, [deleteLabel, isExistingOption]);

  const onSelect = useCallback(
    (kind: string, value: string, keepMenuOpen?: boolean) => {
      setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_KIND_LABEL)(kind);
      setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)(value);
      !keepMenuOpen && setIsOpen(false);
    },
    [setBootableVolumeField],
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
        toggleLabel={
          <SelectInstanceTypeToggle
            selected={selectedInstanceType}
            selectedKind={selectedInstanceTypeKind}
          />
        }
        appendTo={document.getElementById('tab-modal')}
        direction="up"
        id={MENUS.root}
        isOpen={isOpen}
        scrollableMenuIDs={[MENUS.userProvided]}
        setIsOpen={setIsOpen}
      >
        <DrilldownMenuItem {...menuItems.redHatProvided}>
          <RedHatInstanceTypeSeriesMenu
            onSelect={(value, keepMenuOpen) =>
              onSelect(VirtualMachineClusterInstancetypeModel.kind, value, keepMenuOpen)
            }
            selected={selectedInstanceType}
            selectedKind={selectedInstanceTypeKind}
            seriesList={menuItems.redHatProvided.items}
          />
        </DrilldownMenuItem>
        <DrilldownMenuItem {...menuItems.userProvided}>
          <UserInstanceTypeMenu
            allInstanceTypes={allInstanceTypes}
            onSelect={onSelect}
            selected={selectedInstanceType}
            selectedKind={selectedInstanceTypeKind}
          />
        </DrilldownMenuItem>
      </ComposableDrilldownSelect>
    </FormGroup>
  );
};
