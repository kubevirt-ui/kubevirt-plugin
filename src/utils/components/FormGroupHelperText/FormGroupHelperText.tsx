import React, { FCC } from 'react';

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

const FormGroupHelperText: FCC<FormGroupHelperTextProps> = ({
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
