import * as React from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

import useEventListener from './useEventListener';

/**
 * A Hook that returns an input field reference for debouncing the input change callback.
 * @param {number} delay - delay in ms
 * @param callback - callback to be executed after delay
 * @param {string} updateURLParam - name of the URL param to update
 */
export const useInputDebounce = ({
  delay,
  onChange,
  updateURLParam,
  initialValue,
}: {
  delay: number;
  onChange?: (value: string) => void;
  updateURLParam?: string;
  initialValue?: string;
}) => {
  let typingTimer: null | ReturnType<typeof setTimeout> = null;

  const { params, setParam } = useURLParams();
  const [value, setValue] = React.useState<string>();
  const param = params.get(updateURLParam);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // eslint-disable-next-line require-jsdoc
  const updateValue = (v: string) => {
    setValue(v || '');
    if (updateURLParam) {
      setParam(updateURLParam, v);
    }
    if (onChange) {
      onChange(v);
    }
  };

  // eslint-disable-next-line require-jsdoc
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
      setValue(param ?? '');
      inputRef.current.value = param;
    }
  }, [param, updateURLParam]);

  React.useEffect(() => {
    if (initialValue && !value) {
      setValue(initialValue);
      inputRef.current.value = initialValue;
    }
  }, [initialValue, value]);

  return {
    inputRef,
    value,
    resetValue,
  };
};
