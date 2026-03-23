import React, { FC } from 'react';
import classnames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, Split, SplitItem, Title, TitleSizes } from '@patternfly/react-core';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { getOperatingSystemDetails } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/utils';

import './OperatingSystemTile.scss';

type OperatingSystemTileProps = {
  isSelected: boolean;
  onClick: () => void;
  operatingSystem: OperatingSystemType;
};

const OperatingSystemTile: FC<OperatingSystemTileProps> = ({
  isSelected,
  onClick,
  operatingSystem,
}) => {
  const { t } = useKubevirtTranslation();
  const { icon, label } = getOperatingSystemDetails(operatingSystem, t);

  return (
    <Card
      className={classnames('operating-system-tile', 'pf-v6-u-p-md', {
        'operating-system-tile--selected': isSelected,
      })}
      isClickable
      isSelectable
      isSelected={isSelected}
      onClick={onClick}
    >
      <Split hasGutter>
        <SplitItem>
          <img alt={`${label} icon`} className="operating-system-tile__image" src={icon} />
        </SplitItem>
        <SplitItem>
          <Title headingLevel="h1" size={TitleSizes.lg}>
            {label}
          </Title>
        </SplitItem>
      </Split>
    </Card>
  );
};

export default OperatingSystemTile;
