import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, Radio, Split, SplitItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';
import { getVMCreationMethodDetails } from '@virtualmachines/creation-wizard/utils/utils';

import './CreationMethodTile.scss';

type CreationMethodTileProps = {
  creationMethod: VMCreationMethod;
  isChecked: boolean;
  setSelectedCreationMethod: (creationMethod: VMCreationMethod) => void;
};

const CreationMethodTile: FC<CreationMethodTileProps> = ({
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
      className="vm-creation-method-tile pf-v6-u-p-md"
      isClickable
      isSelected={isChecked}
      onClick={handleClick}
    >
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <div className="vm-creation-method-tile__icon">
                <IconComponent />
              </div>
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <Radio
                aria-label={creationMethod}
                className="vm-creation-method-tile__radio"
                id={`${creationMethod}-radio-button`}
                isChecked={isChecked}
                name="creation-method-tile"
                onChange={handleClick}
                tabIndex={-1}
              />
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          <Title headingLevel="h1">{label}</Title>
        </StackItem>
        <StackItem>{description}</StackItem>
      </Stack>
    </Card>
  );
};

export default CreationMethodTile;
