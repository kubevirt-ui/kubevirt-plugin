import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardHeader, Stack, StackItem, Title } from '@patternfly/react-core';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';
import { getVMCreationMethodDetails } from '@virtualmachines/creation-wizard/utils/utils';

import './CreationMethodTile.scss';

type CreationMethodTileProps = {
  creationMethod: VMCreationMethod;
  isChecked: boolean;
  setSelectedCreationMethod: (creationMethod: VMCreationMethod) => void;
};

const CreationMethodTile: FCC<CreationMethodTileProps> = ({
  creationMethod,
  isChecked,
  setSelectedCreationMethod,
}) => {
  const { t } = useKubevirtTranslation();
  const { description, IconComponent, label } = getVMCreationMethodDetails(creationMethod, t);

  const handleClick = () => {
    setSelectedCreationMethod(creationMethod);
  };

  return (
    <Card
      className="vm-creation-method-tile"
      id={creationMethod}
      isClickable
      isSelectable
      isSelected={isChecked}
      onClick={handleClick}
    >
      <CardHeader
        selectableActions={{
          hasNoOffset: true,
          name: 'vm-creation-method-group',
          onChange: handleClick,
          selectableActionAriaLabelledby: creationMethod,
          selectableActionId: creationMethod,
          variant: 'single',
        }}
      >
        <div className="vm-creation-method-tile__icon">
          <IconComponent />
        </div>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2">{label}</Title>
          </StackItem>
          <StackItem>{description}</StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default CreationMethodTile;
