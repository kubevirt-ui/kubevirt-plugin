import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';

import { useIsHighlighted } from './useIsHighlighted';

import './search-item.scss';

type SearchItemProps = {
  children?: ReactNode;
  id: string;
};

const SearchItem: FC<SearchItemProps> = ({ children, id }) => {
  const isHighlighted = useIsHighlighted(id);

  return <span className={classNames({ isHighlighted })}>{children}</span>;
};

export default SearchItem;
