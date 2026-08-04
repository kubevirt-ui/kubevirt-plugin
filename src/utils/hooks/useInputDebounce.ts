import { type MutableRefObject, useEffect, useRef, useState } from 'react';

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
  initialValue,
  onChange,
  updateURLParam,
}: {
  delay: number;
  initialValue?: string;
  onChange?: (value: string) => void;
  updateURLParam?: string;
}): { inputRef: MutableRefObject<HTMLInputElement>; resetValue: () => void; value: string } => {
  const typingTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const { params, setParam } = useURLParams();
  const [value, setValue] = useState<string>();
  const param = params.get(updateURLParam);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateValue = (newValue: string): void => {
    setValue(newValue ?? '');
    if (updateURLParam) {
      setParam(updateURLParam, newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const resetValue = (): void => {
    setValue('');
    if (inputRef?.current?.value) {
      inputRef.current.value = '';
    }
  };

  useEventListener('keydown', () => clearTimeout(typingTimerRef.current), inputRef);
  useEventListener(
    'keyup',
    () => {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => updateValue(inputRef.current?.value ?? ''), delay);
    },
    inputRef,
  );

  useEffect(() => {
    if (updateURLParam) {
      setValue(param ?? '');
      inputRef.current.value = param;
    }
  }, [param, updateURLParam]);

  useEffect(() => {
    if (initialValue && !value) {
      setValue(initialValue);
      inputRef.current.value = initialValue;
    }
  }, [initialValue, value]);

  return {
    inputRef,
    resetValue,
    value,
  };
};
