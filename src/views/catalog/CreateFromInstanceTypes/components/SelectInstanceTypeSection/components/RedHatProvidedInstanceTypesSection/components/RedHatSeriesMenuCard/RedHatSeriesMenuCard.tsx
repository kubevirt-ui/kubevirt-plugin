import React, { FC, useMemo, useRef } from 'react';
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
  menuRef,
  onMenuSelect,
  onMenuToggle,
  rhSeriesItem,
}) => {
  const { t } = useKubevirtTranslation();

  const cardRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const { classAnnotation, classDisplayNameAnnotation, descriptionAnnotation, seriesName, sizes } =
    rhSeriesItem;

  const { Icon, seriesLabel } = instanceTypeSeriesNameMapper[seriesName] || {};

  const isMenuExpanded = useMemo(() => seriesName === activeMenu, [activeMenu, seriesName]);
  const isSelectedMenu = useMemo(
    () => selectedInstanceType?.name?.startsWith(seriesName),
    [selectedInstanceType, seriesName],
  );

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

  const card = (
    <Card
      className={classNames(
        'instance-type-series-menu-card__toggle-card',
        isSelectedMenu && 'selected',
      )}
      onClick={(event) => onMenuToggle(event, seriesName)}
      ref={cardRef}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} direction={{ default: 'column' }}>
        <div className="instance-type-series-menu-card__card-icon">{Icon && <Icon />}</div>
        <CardHeader className="instance-type-series-menu-card__card-title">
          {classDisplayNameAnnotation}
        </CardHeader>
        <CardBody>
          <div className="instance-type-series-menu-card__card-toggle-text" ref={toggleRef}>
            {seriesLabel || classAnnotation} <AngleDownIcon />
          </div>
          <div className="instance-type-series-menu-card__card-footer">
            {isSelectedMenu && selectedITLabel}
          </div>
        </CardBody>
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
                selected={selectedInstanceType?.name}
                seriesName={seriesName}
                setSelected={onMenuSelect}
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
