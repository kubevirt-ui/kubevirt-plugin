import React, { FC } from 'react';

import { FormGroup, TextInput } from '@patternfly/react-core';

import { ephemeralDiskSizeFieldID } from '../DiskSourceSelect/utils/constants';
import { DYNAMIC } from '../utils/constants';

const DynamicSize: FC = () => {
  return (
    <FormGroup fieldId={ephemeralDiskSizeFieldID} label="Size">
      <TextInput id={ephemeralDiskSizeFieldID} isDisabled type="text" value={DYNAMIC} />
    </FormGroup>
  );
};

export default DynamicSize;
