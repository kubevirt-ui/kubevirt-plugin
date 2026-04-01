import React, { CSSProperties, FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import TwoColumnCardBody from './TwoColumnCardBody';
import { TwoColumnCardProps } from './types';

import './TwoColumnCard.scss';

const TwoColumnCard: FC<TwoColumnCardProps> = ({
  bottomLeftContent,
  gridColumns,
  headerActions,
  helpContent,
  isLoading,
  items,
  leftContent,
  nameHeader,
  noDataMessage,
  olsPromptType,
  rightTitle,
  scoreHeader,
  severityCounts,
  severityItemLabel,
  title,
}) => {
  const style = gridColumns
    ? ({ '--two-column-card--columns': gridColumns } as CSSProperties)
    : undefined;

  return (
    <Card className="two-column-card" isCompact>
      <CardHeader
        actions={
          headerActions
            ? {
                actions: headerActions,
                hasNoOffset: false,
              }
            : undefined
        }
      >
        <CardTitle className={helpContent ? 'two-column-card__title' : undefined}>
          {title}
          {helpContent && (
            <HelpTextIcon
              bodyContent={(hide) => {
                return olsPromptType ? (
                  <PopoverContentWithLightspeedButton
                    content={helpContent}
                    hide={hide}
                    promptType={olsPromptType}
                  />
                ) : (
                  helpContent
                );
              }}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <TwoColumnCardBody
          bottomLeftContent={bottomLeftContent}
          isLoading={isLoading}
          items={items}
          leftContent={leftContent}
          nameHeader={nameHeader}
          noDataMessage={noDataMessage}
          rightTitle={rightTitle}
          scoreHeader={scoreHeader}
          severityCounts={severityCounts}
          severityItemLabel={severityItemLabel}
          style={style}
        />
      </CardBody>
    </Card>
  );
};

export default TwoColumnCard;
