import React, { FC, useMemo } from 'react';
import classNames from 'classnames';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import RedHatInstanceTypeSeriesSizesMenuItems from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/components/RedHatInstanceTypeSeriesMenu/RedHatInstanceTypeSeriesSizesMenuItem';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
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
  activeMenu,
  menuRef,
  onMenuSelect,
  onMenuToggle,
  rhSeriesItem,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const { classAnnotation, seriesName, sizes } = rhSeriesItem;

  const { Icon, seriesLabel, seriesTitle } = instanceTypeSeriesNameMapper[seriesName] || {};

  const isMenuExpanded = useMemo(() => seriesName === activeMenu, [activeMenu, seriesName]);
  const isSelectedMenu = useMemo(
    () => selectedInstanceType?.startsWith(seriesName),
    [selectedInstanceType, seriesName],
  );

  const selectedITLabel = useMemo(() => {
    const itSize = sizes?.find(
      (size) => `${seriesName}.${size.sizeLabel}` === selectedInstanceType,
    );

    const { cpus, memory, sizeLabel } = itSize || {};
    return t('{{sizeLabel}}: {{cpus}} CPUs, {{memory}} Memory', {
      cpus,
      memory: readableSizeUnit(memory),
      sizeLabel,
    });
  }, [selectedInstanceType, seriesName, sizes, t]);

  return (
    <Popper
      popper={
        <Menu activeMenu={activeMenu} id={seriesName} ref={menuRef}>
          <MenuContent>
            <MenuList>
              <RedHatInstanceTypeSeriesSizesMenuItems
                selected={selectedInstanceType}
                seriesName={seriesName}
                setSelected={onMenuSelect}
                sizes={sizes}
              />
            </MenuList>
          </MenuContent>
        </Menu>
      }
      trigger={
        <MenuToggle
          className={classNames(
            'instance-type-series-menu-card__toggle-container',
            isSelectedMenu && 'selected',
          )}
          isExpanded={isMenuExpanded}
          onClick={(event) => onMenuToggle(event, seriesName)}
          variant="plain"
        >
          <Card className="instance-type-series-menu-card__toggle-card">
            <div className="instance-type-series-menu-card__card-icon">{Icon && <Icon />}</div>
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
      direction="down"
      isVisible={isMenuExpanded}
      popperMatchesTriggerWidth={false}
    />
  );
};

export default RedHatSeriesMenuCard;
