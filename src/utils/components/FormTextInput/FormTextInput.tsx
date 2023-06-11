import React, { ComponentProps, forwardRef, HTMLProps } from 'react';

import { TextInput, TextInputProps } from '@patternfly/react-core';

// PatternFly changes the signature of the 'onChange' handler for input elements.
// This causes issues with React Hook Form as it expects the default signature for an input element.
// So we have to create this wrapper component that takes care of converting these signatures for us.

export type FormTextInputProps = Omit<ComponentProps<typeof TextInput>, 'onChange'> &
  Pick<HTMLProps<HTMLInputElement>, 'onChange'>;

export const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
  ({ onChange, ...props }, ref) => {
    const onChangeForward: TextInputProps['onChange'] = (_, event) => onChange?.(event);

    return <TextInput {...props} onChange={onChangeForward} ref={ref} />;
  },
);

// We need to fake the displayName to match what PatternFly expects.
// This is because PatternFly uses it to filter children in certain aspects.
// This is a stupid approach, but it's not like we can change that.
FormTextInput.displayName = 'TextInput';
