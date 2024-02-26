import React, { FC } from 'react';

import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  ValidatedOptions,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

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
        icon={validated === ValidatedOptions.error && <ExclamationCircleIcon color="red" />}
        variant={validated}
      >
        {children}
      </HelperTextItem>
    </HelperText>
  </FormHelperText>
);

export default FormGroupHelperText;
