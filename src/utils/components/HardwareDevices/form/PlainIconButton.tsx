import * as React from 'react';

import { Button, ButtonVariant, FormGroup, GridItem } from '@patternfly/react-core';

type PlainIconButtonProps = {
  fieldId: string;
  icon: React.ReactNode;
  onClick: () => void;
  withKeyValueTitle?: boolean;
};

const PlainIconButton: React.FC<PlainIconButtonProps> = ({
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
