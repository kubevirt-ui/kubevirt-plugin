import React, { ComponentProps, forwardRef, HTMLProps, useState } from 'react';

import { Button, ButtonVariant, Split, TextInput, TextInputProps } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

// PatternFly changed the signature of the 'onChange' handler for input elements.
// This causes issues with React Hook Form as it expects the default signature for an input element.
// So we have to create this wrapper component that takes care of converting these signatures for us.

export type FormPasswordInputProps = Omit<ComponentProps<typeof TextInput>, 'onChange'> &
  Pick<HTMLProps<HTMLInputElement>, 'onChange'>;

export const FormPasswordInput = forwardRef<HTMLInputElement, FormPasswordInputProps>(
  ({ onChange, ...props }, ref) => {
    const [passwordHidden, setPasswordHidden] = useState(true);
    const onChangeForward: TextInputProps['onChange'] = (event) => onChange?.(event);

    return (
      <Split>
        <TextInput
          {...props}
          onChange={(event, _value) => onChangeForward(event, _value)}
          ref={ref}
          type={passwordHidden ? 'password' : 'text'}
        />
        <Button onClick={() => setPasswordHidden(!passwordHidden)} variant={ButtonVariant.link}>
          {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </Split>
    );
  },
);

// We need to fake the displayName to match what PatternFly expects.
// This is because PatternFly uses it to filter children in certain aspects.
FormPasswordInput.displayName = 'TextInput';
