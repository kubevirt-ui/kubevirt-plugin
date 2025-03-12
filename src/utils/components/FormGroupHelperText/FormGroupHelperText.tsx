import React, { FC } from 'react';

import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  ValidatedOptions,
} from '@patternfly/react-core';

import { ErrorIcon } from '../ErrorIcon/ErrorIcon';

type FormGroupHelperTextProps = {
  validated?: ValidatedOptions;
};

const FormGroupHelperText: FC<FormGroupHelperTextProps> = ({
  children,
  validated = ValidatedOptions.default,
}) => (
  <FormHelperText>
    <HelperText>
      <HelperTextItem
        icon={validated === ValidatedOptions.error && <ErrorIcon />}
        variant={validated}
      >
        {children}
      </HelperTextItem>
    </HelperText>
  </FormHelperText>
);

export default FormGroupHelperText;
