import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import './search-item.scss';

type SearchItemProps = {
  id: string;
};

const SearchItem: FC<SearchItemProps> = ({ children, id }) => {
  const location = useLocation();

  const isColored = location?.hash?.toLowerCase().endsWith(id.toLowerCase());

  return <div className={classNames({ isColored })}>{children}</div>;
};

export default SearchItem;
