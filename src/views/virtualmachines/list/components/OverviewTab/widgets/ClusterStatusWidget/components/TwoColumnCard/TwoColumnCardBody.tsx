import React, { FCC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { Bullseye } from '@patternfly/react-core';

import StatusScoreList from '../../../shared/StatusScoreList/StatusScoreList';

import LoadingSkeleton from './LoadingSkeleton';
import SeverityCountList from './SeverityCountList';
import { TwoColumnCardBodyProps } from './types';

const TwoColumnCardBody: FCC<TwoColumnCardBodyProps> = ({
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
    <div className="two-column-card__layout" style={style}>
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
