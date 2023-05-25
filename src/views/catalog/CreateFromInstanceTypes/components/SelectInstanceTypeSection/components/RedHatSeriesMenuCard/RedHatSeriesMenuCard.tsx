import React, { FC, useMemo } from 'react';
import classNames from 'classnames';

import RedHatInstanceTypeSeriesSizesMenuItems from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItem';
import { instanceTypeSeriesNameMapper } from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeSeries } from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  Card,
  CardBody,
  CardFooter,
  Menu,
  MenuContent,
  MenuList,
  MenuToggle,
  Popper,
} from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons';

import { UseInstanceTypeCardMenuSectionValues } from '../../utils/types';

import './RedHatSeriesMenuCard.scss';

type RedHatSeriesMenuCardProps = {
  rhSeriesItem: RedHatInstanceTypeSeries;
} & UseInstanceTypeCardMenuSectionValues;

const RedHatSeriesMenuCard: FC<RedHatSeriesMenuCardProps> = ({
  rhSeriesItem,
  menuRef,
  activeMenu,
  onMenuToggle,
  onMenuSelect,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const { classAnnotation, seriesName, sizes } = rhSeriesItem;

  const { Icon, seriesLabel, seriesTitle } = instanceTypeSeriesNameMapper[seriesName];

  const isMenuExpanded = useMemo(() => seriesName === activeMenu, [activeMenu, seriesName]);
  const isSelectedMenu = useMemo(
    () => selectedInstanceType?.startsWith(seriesName),
    [selectedInstanceType, seriesName],
  );

  const selectedITLabel = useMemo(() => {
    const itSize = sizes?.find(
      (size) => `${seriesName}.${size.sizeLabel}` === selectedInstanceType,
    );

    const { sizeLabel, cpus, memory } = itSize || {};
    return t('{{sizeLabel}}: {{cpus}} CPUs, {{memory}} Memory', {
      sizeLabel,
      cpus,
      memory: readableSizeUnit(memory),
    });
  }, [selectedInstanceType, seriesName, sizes, t]);

  return (
    <Popper
      direction="down"
      isVisible={isMenuExpanded}
      popperMatchesTriggerWidth={false}
      trigger={
        <MenuToggle
          id="series-card-toggle"
          onClick={(event) => onMenuToggle(event, seriesName)}
          isExpanded={isMenuExpanded}
          variant="plain"
          className={classNames(
            'instance-type-series-menu-card__toggle-container',
            isSelectedMenu && 'selected',
          )}
        >
          <Card className="instance-type-series-menu-card__toggle-card">
            <div className="instance-type-series-menu-card__card-icon">
              <Icon />
            </div>
            <CardBody>
              <div className="instance-type-series-menu-card__card-title">{seriesTitle}</div>
              <div className="instance-type-series-menu-card__card-toggle-text">
                {seriesLabel || classAnnotation} <AngleDownIcon />
              </div>
            </CardBody>
            <CardFooter className="instance-type-series-menu-card__card-footer">
              {isSelectedMenu && selectedITLabel}
            </CardFooter>
          </Card>
        </MenuToggle>
      }
      popper={
        <Menu ref={menuRef} id={seriesName} activeMenu={activeMenu}>
          <MenuContent>
            <MenuList>
              <RedHatInstanceTypeSeriesSizesMenuItems
                sizes={sizes}
                selected={selectedInstanceType}
                seriesName={seriesName}
                setSelected={onMenuSelect}
              />
            </MenuList>
          </MenuContent>
        </Menu>
      }
    />
  );
};

export default RedHatSeriesMenuCard;
