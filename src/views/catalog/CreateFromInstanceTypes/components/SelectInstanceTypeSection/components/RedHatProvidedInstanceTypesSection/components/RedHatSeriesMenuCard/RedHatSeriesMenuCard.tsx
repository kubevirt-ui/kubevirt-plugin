import React, { FC, useMemo, useRef } from 'react';
import classNames from 'classnames';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import RedHatInstanceTypeSeriesSizesMenuItems from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItems';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import {
  getSeriesLabel,
  getSeriesSymbol,
  seriesHasHugepagesVariant,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import HugepagesInfo from '@kubevirt-utils/components/HugepagesInfo/HugepagesInfo';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Popper,
  Tooltip,
} from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons';

import { UseInstanceTypeCardMenuSectionValues } from '../../../../utils/types';

import { renderMarkdownTooltip } from './utils';

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

  const { classDisplayNameAnnotation, descriptionAnnotation, seriesName, sizes } = rhSeriesItem;

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

  const defaultSeriesLabel = useMemo(() => getSeriesLabel(seriesName, t), [seriesName, t]);

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
        <div className="instance-type-series-menu-card__card-icon">
          {Icon ? <Icon /> : getSeriesSymbol(seriesName)}
        </div>
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
            {seriesLabel || defaultSeriesLabel}
          </Button>
          <div className="instance-type-series-menu-card__card-selected-option">
            {isSelectedMenu && selectedITLabel}
          </div>
        </CardBody>
      </Flex>
    </Card>
  );

  const getMenuItems = (isHugepages?: boolean) => (
    <RedHatInstanceTypeSeriesSizesMenuItems
      isHugepages={isHugepages}
      onSelect={onMenuSelect}
      selected={selectedInstanceType?.name}
      seriesName={seriesName}
      sizes={sizes}
    />
  );

  return (
    <Popper
      popper={
        <Menu activeMenu={activeMenu} containsFlyout id={seriesName} ref={menuRef}>
          <MenuContent>
            <MenuList>
              {seriesHasHugepagesVariant(seriesName) ? (
                <>
                  <MenuItem
                    flyoutMenu={
                      <Menu>
                        <MenuContent>
                          <MenuList>{getMenuItems(true)}</MenuList>
                        </MenuContent>
                      </Menu>
                    }
                  >
                    <HugepagesInfo />
                  </MenuItem>
                  <Divider component="li" />
                  {getMenuItems(false)}
                </>
              ) : (
                getMenuItems()
              )}
            </MenuList>
          </MenuContent>
        </Menu>
      }
      trigger={
        !isMenuExpanded ? (
          <Tooltip content={renderMarkdownTooltip(descriptionAnnotation)}>{card}</Tooltip>
        ) : (
          card
        )
      }
      isVisible={isMenuExpanded}
      triggerRef={toggleRef}
    />
  );
};

export default RedHatSeriesMenuCard;
