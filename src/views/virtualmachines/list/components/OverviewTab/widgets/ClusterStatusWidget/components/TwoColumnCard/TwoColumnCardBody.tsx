import React, { FC } from 'react';
import classNames from 'classnames';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { Bullseye } from '@patternfly/react-core';

import StatusScoreList from '../../../shared/StatusScoreList/StatusScoreList';

import LoadingSkeleton from './LoadingSkeleton';
import SeverityCountList from './SeverityCountList';
import { TwoColumnCardBodyProps } from './types';

const TwoColumnCardBody: FC<TwoColumnCardBodyProps> = ({
  bottomLeftContent,
  isLoading,
  items,
  leftContent,
  nameHeader,
  noDataMessage,
  rightTitle,
  scoreHeader,
  severityCounts,
  severityItemLabel,
  stackable,
  style,
}) => {
  if (noDataMessage) {
    return (
      <Bullseye>
        <MutedTextSpan text={noDataMessage} />
      </Bullseye>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      className={classNames('two-column-card__layout', {
        'two-column-card__layout--stackable': stackable,
      })}
      style={style}
    >
      <div className="two-column-card__left">
        {leftContent ?? (
          <SeverityCountList itemLabel={severityItemLabel} severityCounts={severityCounts ?? []} />
        )}
        {bottomLeftContent}
      </div>
      <div className="two-column-card__right">
        {rightTitle && <div className="two-column-card__right-title">{rightTitle}</div>}
        <StatusScoreList items={items} nameHeader={nameHeader} scoreHeader={scoreHeader} />
      </div>
    </div>
  );
};

export default TwoColumnCardBody;
