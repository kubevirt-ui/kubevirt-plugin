import React, { FCC } from 'react';
import classNames from 'classnames';

import { useIsHighlighted } from './useIsHighlighted';

import './search-item.scss';

type SearchItemProps = {
  id: string;
};

const SearchItem: FCC<SearchItemProps> = ({ children, id }) => {
  const isHighlighted = useIsHighlighted(id);

  return <span className={classNames({ isHighlighted })}>{children}</span>;
};

export default SearchItem;
