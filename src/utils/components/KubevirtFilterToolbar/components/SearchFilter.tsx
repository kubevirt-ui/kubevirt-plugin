import { forwardRef, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { TextInput, type TextInputProps } from '@patternfly/react-core';

type SearchFilterProps = {
  className?: string;
  placeholder: string;
} & TextInputProps;

const SearchFilter = forwardRef<HTMLInputElement, SearchFilterProps>((props, ref) => {
  const { className, placeholder, ...otherInputProps } = props;

  const defaultRef = useRef<HTMLInputElement>(null);

  const inputRef = ref ?? defaultRef;

  useEffect(() => {
    const inputElement = typeof inputRef === 'function' ? null : inputRef.current;

    if (!inputElement) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === '/' && !inputElement.matches(':focus')) {
        inputElement.focus();
        event.preventDefault();
      }
    };

    inputElement.addEventListener('keydown', onKeyDown);

    return (): void => {
      inputElement.removeEventListener('keydown', onKeyDown);
    };
  }, [inputRef]);

  return (
    <div className="co-text-filter">
      <TextInput
        {...otherInputProps}
        aria-label={placeholder}
        className={classNames('co-text-filter__text-input', className)}
        data-test="item-filter"
        placeholder={placeholder}
        ref={inputRef}
        tabIndex={0}
        type="text"
      />
    </div>
  );
});

export default SearchFilter;
