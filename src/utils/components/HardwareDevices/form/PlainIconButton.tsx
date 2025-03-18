import * as React from 'react';

import { Button, ButtonVariant, FormGroup, GridItem } from '@patternfly/react-core';

type PlainIconButtonProps = {
  fieldId: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const PlainIconButton: React.FC<PlainIconButtonProps> = ({ fieldId, icon, onClick }) => {
  return (
    <GridItem span={1}>
      <FormGroup fieldId={fieldId} label=" ">
        <Button icon={icon} onClick={onClick} variant={ButtonVariant.plain} />
      </FormGroup>
    </GridItem>
  );
};

export default PlainIconButton;
