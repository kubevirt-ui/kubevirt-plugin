import React, { FC } from 'react';
import classNames from 'classnames';

import { useIsHighlighted } from './useIsHighlighted';

import './search-item.scss';

type SearchItemProps = {
  id: string;
};

const SearchItem: FC<SearchItemProps> = ({ children, id }) => {
  const isHighlighted = useIsHighlighted(id);

  return <span className={classNames({ isHighlighted })}>{children}</span>;
};

export default SearchItem;
