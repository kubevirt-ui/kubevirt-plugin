import type { FC } from 'react';
import React from 'react';

import StatusScoreItem from './StatusScoreItem';
import type { StatusScoreItem as StatusScoreItemType } from './types';

import './StatusScoreList.scss';

export type { ExtraScoreItem, ScoreStatus, StatusScoreItem } from './types';

type StatusScoreListProps = {
  items: StatusScoreItemType[];
  nameHeader: string;
  scoreHeader: string;
};

const StatusScoreList: FC<StatusScoreListProps> = ({ items, nameHeader, scoreHeader }) => {
  return (
    <div className="status-score-list">
      <div className="status-score-list__header">
        <span>{nameHeader}</span>
        <span className="status-score-list__header-score">{scoreHeader}</span>
      </div>
      {(items ?? []).map((item) => (
        <StatusScoreItem item={item} key={item.name} />
      ))}
    </div>
  );
};

export default StatusScoreList;
