import React from 'react';

import { TextInput, TextInputProps } from '@patternfly/react-core';

type DebouncedTextInputProps = Omit<TextInputProps, 'value'> &
  React.RefAttributes<HTMLInputElement> & {
    initialValue?: string;
    debounceTime?: number;
  };

export const DebouncedTextInput: React.ForwardRefExoticComponent<DebouncedTextInputProps> =
  React.memo(({ debounceTime = 200, initialValue, onChange, ...props }) => {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
      const handler = setTimeout(() => onChange(value, undefined), debounceTime);

      return () => clearTimeout(handler);
    }, [value, debounceTime, onChange]);

    return <TextInput {...props} value={value} onChange={setValue} />;
  });
