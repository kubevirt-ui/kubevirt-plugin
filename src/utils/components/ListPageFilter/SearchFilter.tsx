import React, { FC } from 'react';
import classNames from 'classnames';

import { TextInput, TextInputProps } from '@patternfly/react-core';

type SearchFilterProps = {
  className?: string;
  placeholder: string;
} & TextInputProps;

const SearchFilter: FC<SearchFilterProps> = (props) => {
  const { className, placeholder, ...otherInputProps } = props;

  return (
    <div className="has-feedback">
      <TextInput
        {...otherInputProps}
        aria-label={placeholder}
        className={classNames('co-text-filter', className)}
        data-test-id="item-filter"
        placeholder={placeholder}
        tabIndex={0}
        type="text"
      />
    </div>
  );
};

export default SearchFilter;
