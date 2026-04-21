import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { ephemeralDiskSizeFieldID } from '../DiskSourceSelect/utils/constants';
import { DYNAMIC } from '../utils/constants';

const DynamicSize: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId={ephemeralDiskSizeFieldID} label="Size">
      <TextInput id={ephemeralDiskSizeFieldID} isDisabled type="text" value={t(DYNAMIC)} />
    </FormGroup>
  );
};

export default DynamicSize;
