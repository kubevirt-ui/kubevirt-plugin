import React, { FC, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import RedHatInstanceTypeSeriesSizesMenuItems from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItem';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import {
  getOppositeHugepagesInstanceType,
  seriesHasHugepagesVariant,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import HugepagesCheckbox from '@kubevirt-utils/components/HugepagesCheckbox/HugepagesCheckbox';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Menu,
  MenuContent,
  MenuList,
  Popper,
  Tooltip,
} from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons';

import { UseInstanceTypeCardMenuSectionValues } from '../../../../utils/types';

import './RedHatSeriesMenuCard.scss';

type RedHatSeriesMenuCardProps = {
  rhSeriesItem: RedHatInstanceTypeSeries;
} & UseInstanceTypeCardMenuSectionValues;

const RedHatSeriesMenuCard: FC<RedHatSeriesMenuCardProps> = ({
  activeMenu,
  onMenuSelect,
  onMenuToggle,
  rhSeriesItem,
}) => {
  const { t } = useKubevirtTranslation();

  const cardRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const { classAnnotation, classDisplayNameAnnotation, descriptionAnnotation, seriesName, sizes } =
    rhSeriesItem;

  const { Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const isMenuExpanded = useMemo(() => seriesName === activeMenu, [activeMenu, seriesName]);
  const isSelectedMenu = useMemo(
    () =>
      // check if namespace is null to avoid mixing with user provided instance types with similar name
      selectedInstanceType?.namespace === null &&
      selectedInstanceType?.name?.startsWith(seriesName),
    [selectedInstanceType, seriesName],
  );

  const handleMenuClose = () => {
    if (isMenuExpanded) {
      onMenuToggle(undefined, seriesName);
    }
  };

  useClickOutside([menuRef], handleMenuClose);

  const selectedITLabel = useMemo(() => {
    const itSize = sizes?.find(
      (size) => `${seriesName}.${size.sizeLabel}` === selectedInstanceType?.name,
    );

    const { cpus, memory, sizeLabel } = itSize || {};
    return t('{{sizeLabel}}: {{cpus}} CPUs, {{memory}} Memory', {
      cpus,
      memory: readableSizeUnit(memory),
      sizeLabel,
    });
  }, [selectedInstanceType, seriesName, sizes, t]);

  const [isHugepages, setIsHugepages] = useState(false);

  const card = (
    <Card
      className={classNames(
        'instance-type-series-menu-card__toggle-card',
        isSelectedMenu && 'selected',
      )}
      isCompact
      ref={cardRef}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} direction={{ default: 'column' }}>
        <div className="instance-type-series-menu-card__card-icon">{Icon && <Icon />}</div>
        <CardHeader className="instance-type-series-menu-card__card-title">
          {classDisplayNameAnnotation}
        </CardHeader>
        <CardBody>
          <Button
            className="instance-type-series-menu-card__card-toggle-text"
            icon={<AngleDownIcon />}
            iconPosition="end"
            onClick={(event) => onMenuToggle(event, seriesName)}
            ref={toggleRef}
            variant="link"
          >
            {seriesLabel || classAnnotation}
          </Button>
          <div className="instance-type-series-menu-card__card-selected-option">
            {isSelectedMenu && selectedITLabel}
          </div>
        </CardBody>
        {seriesHasHugepagesVariant(seriesName) && (
          <CardFooter>
            <HugepagesCheckbox
              onHugepagesChange={(_, checked) => {
                setIsHugepages(checked);
                if (isSelectedMenu) {
                  onMenuSelect(
                    getOppositeHugepagesInstanceType(selectedInstanceType.name, checked),
                  );
                }
              }}
              id={`${seriesName}-card`}
              isHugepages={isHugepages}
            />
          </CardFooter>
        )}
      </Flex>
    </Card>
  );

  return (
    <Popper
      popper={
        <Menu activeMenu={activeMenu} id={seriesName} ref={menuRef}>
          <MenuContent>
            <MenuList>
              <RedHatInstanceTypeSeriesSizesMenuItems
                isHugepages={isHugepages}
                onSelect={onMenuSelect}
                selected={selectedInstanceType?.name}
                seriesName={seriesName}
                sizes={sizes}
              />
            </MenuList>
          </MenuContent>
        </Menu>
      }
      isVisible={isMenuExpanded}
      trigger={!isMenuExpanded ? <Tooltip content={descriptionAnnotation}>{card}</Tooltip> : card}
      triggerRef={toggleRef}
    />
  );
};

export default RedHatSeriesMenuCard;
