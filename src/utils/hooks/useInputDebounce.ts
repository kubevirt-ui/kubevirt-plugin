import * as React from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

import useEventListener from './useEventListener';

export const useInputDebounce = ({
  delay,
  onChange,
  updateURLParam,
}: {
  delay: number;
  onChange?: (value: string) => void;
  updateURLParam?: string;
}) => {
  let typingTimer: null | ReturnType<typeof setTimeout> = null;

  const { params, setParam } = useURLParams();
  const [value, setValue] = React.useState<string>('');
  const param = params.get(updateURLParam);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const updateValue = (v: string) => {
    setValue(v || '');
    if (updateURLParam) {
      setParam(updateURLParam, v);
    }
    if (onChange) {
      onChange(v);
    }
  };

  const resetValue = () => {
    setValue('');
    if (inputRef?.current?.value) {
      inputRef.current.value = '';
    }
  };

  useEventListener('keydown', () => clearTimeout(typingTimer));
  useEventListener('keyup', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => updateValue(inputRef.current?.value || ''), delay);
  });

  React.useEffect(() => {
    if (updateURLParam) {
      if (param && !inputRef.current.value) {
        setValue(param);
        inputRef.current.value = param;
      }
    }
  }, [param, updateURLParam]);

  return {
    inputRef,
    value,
    resetValue,
  };
};
