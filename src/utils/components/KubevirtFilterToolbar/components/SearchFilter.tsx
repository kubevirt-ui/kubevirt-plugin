import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';

import { TextInput, type TextInputProps } from '@patternfly/react-core';

type SearchFilterProps = {
  className?: string;
  placeholder: string;
} & TextInputProps;

const SearchFilter = forwardRef<HTMLInputElement, SearchFilterProps>((props, ref) => {
  const { className, placeholder, ...otherInputProps } = props;

  const defaultRef = useRef<HTMLInputElement>(null);

  const inputRef = useMemo(() => ref ?? defaultRef, [ref]);

  useEffect(() => {
    const inputElement = inputRef && 'current' in inputRef ? inputRef.current : null;
    if (!inputElement) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      const activeElement = document.activeElement;
      if (event.key === '/' && activeElement !== inputElement) {
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

SearchFilter.displayName = 'SearchFilter';

export default SearchFilter;
