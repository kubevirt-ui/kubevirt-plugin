import React, { FC, ReactNode } from 'react';

import { Button, ButtonVariant, FormGroup, GridItem } from '@patternfly/react-core';

type PlainIconButtonProps = {
  fieldId: string;
  icon: ReactNode;
  onClick: () => void;
  withKeyValueTitle?: boolean;
};

const PlainIconButton: FC<PlainIconButtonProps> = ({
  fieldId,
  icon,
  onClick,
  withKeyValueTitle,
}) => {
  const button = <Button icon={icon} onClick={onClick} variant={ButtonVariant.plain} />;
  return (
    <GridItem span={1}>
      {withKeyValueTitle ? (
        <FormGroup fieldId={fieldId} label=" ">
          {button}
        </FormGroup>
      ) : (
        button
      )}
    </GridItem>
  );
};

export default PlainIconButton;
