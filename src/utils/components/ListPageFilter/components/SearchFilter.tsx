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

  const inputRef = useMemo(
    (): React.RefObject<HTMLInputElement> | typeof ref => ref ?? defaultRef,
    [ref],
  );

  useEffect(() => {
    if (!inputRef || !('current' in inputRef) || !inputRef.current) return;

    const element = inputRef.current;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === '/' && element !== document.activeElement) {
        element.focus();
        event.preventDefault();
      }
    };

    element.addEventListener('keydown', onKeyDown);

    return (): void => {
      element.removeEventListener('keydown', onKeyDown);
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
