import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Tooltip } from '@patternfly/react-core';

import { StatusScoreItem as StatusScoreItemType } from './types';

type StatusScoreItemProps = {
  item: StatusScoreItemType;
};

const StatusScoreItem: FC<StatusScoreItemProps> = ({ item }) => {
  const { t } = useKubevirtTranslation();
  const { extraCount, extraItems, name, score, tags } = item;
  const { description, status, value } = score;
  const hasExtras = (extraCount ?? 0) > 0 && extraItems;

  const NAME_TOOLTIP_THRESHOLD = 25;
  const isTruncated = name.length >= NAME_TOOLTIP_THRESHOLD;
  const nameElement = (
    <span className={`status-score-list__name${isTruncated ? '--truncated' : ''}`}>{name}</span>
  );

  return (
    <div className="status-score-list__row" key={name}>
      {isTruncated ? <Tooltip content={name}>{nameElement}</Tooltip> : nameElement}
      {description ? (
        <Tooltip content={value}>
          <span tabIndex={0}>
            <Label
              className="status-score-list__label status-score-list__label--clickable"
              isCompact
              status={status}
              variant="outline"
            >
              {description}
            </Label>
          </span>
        </Tooltip>
      ) : (
        <Label className="status-score-list__label" isCompact status={status} variant="outline">
          {value}
        </Label>
      )}
      <span className="status-score-list__tags">
        {tags?.map((tag) => (
          <span className="status-score-list__tag" key={tag}>
            {tag}
          </span>
        ))}
      </span>
      <span className="status-score-list__extra-col">
        {hasExtras && (
          <Tooltip
            content={
              <div>
                {extraItems.map((extra) => (
                  <div key={extra.name}>
                    {extra.name} {extra.value}
                  </div>
                ))}
              </div>
            }
            isContentLeftAligned
          >
            <span tabIndex={0}>
              <Label className="status-score-list__extra" isCompact variant="outline">
                {t('+{{extraCount}} more', { extraCount })}
              </Label>
            </span>
          </Tooltip>
        )}
      </span>
    </div>
  );
};

export default StatusScoreItem;
