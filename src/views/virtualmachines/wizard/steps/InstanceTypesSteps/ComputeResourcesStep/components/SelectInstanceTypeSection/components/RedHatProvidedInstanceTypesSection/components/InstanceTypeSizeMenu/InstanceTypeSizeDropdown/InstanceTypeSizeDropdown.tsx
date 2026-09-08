import React, { type FC, useMemo, useRef, useState } from 'react';

import { type InstanceTypeSize } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { is1GiInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { seriesHasHugepagesVariant } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import HugepagesInfo from '@kubevirt-utils/components/HugepagesInfo/HugepagesInfo';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
} from '@patternfly/react-core';

import './InstanceTypeSizeDropdown.scss';

type InstanceTypeSizeDropdownProps = {
  isDisabled?: boolean;
  onSizeSelect: (size: string) => void;
  selectedSize: string;
  seriesName: string;
  sizes: InstanceTypeSize[];
};

const InstanceTypeSizeDropdown: FC<InstanceTypeSizeDropdownProps> = ({
  isDisabled = false,
  onSizeSelect,
  selectedSize,
  seriesName,
  sizes,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, toggleRef], () => setIsOpen(false));

  const { hugepagesSizes, standardSizes } = useMemo(() => {
    if (!seriesHasHugepagesVariant(seriesName)) {
      return { hugepagesSizes: [], standardSizes: sizes };
    }
    return {
      hugepagesSizes: sizes.filter((size) => is1GiInstanceType(size.sizeLabel)),
      standardSizes: sizes.filter((size) => !is1GiInstanceType(size.sizeLabel)),
    };
  }, [seriesName, sizes]);

  const getSizeLabel = (size: InstanceTypeSize): string => {
    return t('{{sizeLabel}}: {{cpus}} CPUs, {{memory}} Memory', {
      cpus: size.cpus,
      memory: readableSizeUnit(size.memory),
      sizeLabel: size.sizeLabel,
    });
  };

  const selectedSizeObj = sizes.find((size) => size.sizeLabel === selectedSize);
  const selectedLabel = selectedSizeObj ? getSizeLabel(selectedSizeObj) : t('Select size');

  const handleSelect = (sizeLabel: string): void => {
    onSizeSelect(sizeLabel);
    setIsOpen(false);
  };

  const onToggle = (): void => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const renderHugepagesMenu = (): React.JSX.Element => (
    <Menu>
      <MenuContent>
        <MenuList>
          {hugepagesSizes.map((size) => (
            <MenuItem
              isSelected={size.sizeLabel === selectedSize}
              key={size.sizeLabel}
              onClick={() => handleSelect(size.sizeLabel)}
            >
              {getSizeLabel(size)}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <>
      <MenuToggle
        isDisabled={isDisabled}
        isExpanded={isOpen}
        isFullWidth
        onClick={onToggle}
        ref={toggleRef}
      >
        {selectedLabel}
      </MenuToggle>
      <Popper
        isVisible={isOpen}
        popper={
          <Menu className="instance-type-size-dropdown__menu" containsFlyout ref={menuRef}>
            <MenuContent>
              <MenuList>
                {!isEmpty(hugepagesSizes) && (
                  <>
                    <MenuItem flyoutMenu={renderHugepagesMenu()}>
                      <HugepagesInfo />
                    </MenuItem>
                    <Divider component="li" />
                  </>
                )}
                {standardSizes.map((size) => (
                  <MenuItem
                    data-test={`instance-type-size-${size.sizeLabel}`}
                    isSelected={size.sizeLabel === selectedSize}
                    key={size.sizeLabel}
                    onClick={() => handleSelect(size.sizeLabel)}
                  >
                    {getSizeLabel(size)}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        triggerRef={toggleRef}
      />
    </>
  );
};

export default InstanceTypeSizeDropdown;
