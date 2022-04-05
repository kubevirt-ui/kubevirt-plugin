import * as React from 'react';

import { Button, FormGroup, GridItem } from '@patternfly/react-core';

type PlainIconButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  fieldId: string;
};

const PlainIconButton: React.FC<PlainIconButtonProps> = ({ onClick, icon, fieldId }) => {
  return (
    <GridItem span={1}>
      <FormGroup label=" " fieldId={fieldId}>
        <Button variant="plain" onClick={onClick}>
          {icon}
        </Button>
      </FormGroup>
    </GridItem>
  );
};

export default PlainIconButton;
