import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import {
  DEFAULT_INSTANCETYPE_KIND_LABEL,
  DEFAULT_INSTANCETYPE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, PopoverPosition, type PopperProps } from '@patternfly/react-core';

import ComposableDrilldownSelect from './components/ComposableDrilldownSelect/ComposableDrilldownSelect';
import DrilldownMenuItem from './components/DrilldownMenuItem/DrilldownMenuItem';
import RedHatInstanceTypeSeriesMenu from './components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesMenu';
import SelectInstanceTypeToggle from './components/SelectInstanceTypeToggle/SelectInstanceTypeToggle';
import UserInstanceTypeMenu from './components/UserInstanceTypeMenu/UserInstanceTypeMenu';
import { MENUS } from './utils/constants';
import { getInstanceTypeMenuItems, isExistingInstanceType } from './utils/utils';

type InstanceTypeDrilldownSelectProps = {
  appendTo?: HTMLElement | (() => HTMLElement);
  cluster?: string;
  deleteLabel: (labelKey: string) => void;
  direction?: PopperProps['direction'];
  isDisabled?: boolean;
  labels?: Record<string, string>;
  namespace: string;
  setLabel: (labelKey: string, value: string) => void;
};

const getDefaultAppendTo = (): HTMLElement => document.getElementById('tab-modal') ?? document.body;

export const InstanceTypeDrilldownSelect: FC<InstanceTypeDrilldownSelectProps> = ({
  appendTo,
  cluster,
  deleteLabel,
  direction = 'up',
  isDisabled,
  labels,
  namespace,
  setLabel,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { allInstanceTypes } = useInstanceTypesAndPreferences(namespace, cluster);
  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);
  const sortedRedHatProvided = menuItems.redHatProvided.items.toSorted((a, b) =>
    universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
  );
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
      setLabel(DEFAULT_INSTANCETYPE_KIND_LABEL, kind);
      setLabel(DEFAULT_INSTANCETYPE_LABEL, value);
      !keepMenuOpen && setIsOpen(false);
    },
    [setLabel],
  );

  return (
    <FormGroup
      label={t('Default InstanceType')}
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t('The default InstanceType for this volume.')}
              hide={hide}
              promptType={OLSPromptType.DEFAULT_INSTANCETYPE}
            />
          )}
          position={PopoverPosition.right}
        />
      }
    >
      <ComposableDrilldownSelect
        appendTo={appendTo ?? getDefaultAppendTo}
        direction={direction}
        id={MENUS.root}
        isDisabled={isDisabled}
        isOpen={isOpen}
        scrollableMenuIDs={[MENUS.userProvided]}
        setIsOpen={setIsOpen}
        toggleLabel={
          <SelectInstanceTypeToggle
            selected={selectedInstanceType}
            selectedKind={selectedInstanceTypeKind}
          />
        }
      >
        <DrilldownMenuItem {...menuItems.redHatProvided} label={t(menuItems.redHatProvided.label)}>
          <RedHatInstanceTypeSeriesMenu
            cluster={cluster}
            onSelect={(value, keepMenuOpen) =>
              onSelect(VirtualMachineClusterInstancetypeModel.kind, value, keepMenuOpen)
            }
            selected={selectedInstanceType}
            selectedKind={selectedInstanceTypeKind}
            seriesList={sortedRedHatProvided}
          />
        </DrilldownMenuItem>
        <DrilldownMenuItem {...menuItems.userProvided} label={t(menuItems.userProvided.label)}>
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
