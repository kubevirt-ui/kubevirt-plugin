import React, { FC, ReactNode } from 'react';

import { GridItem } from '@patternfly/react-core';

type TestStatisticsItemProps = {
  icon?: ReactNode;
  label: string;
  size: 'large' | 'medium';
  value: number;
};

const TestStatisticsItem: FC<TestStatisticsItemProps> = ({ icon, label, size, value }) => (
  <GridItem className="test-statistics__grid-item" span={3}>
    <div className={`test-statistics__item test-statistics__item--${size}`}>
      <div className="test-statistics__item--count">
        {icon && <span className="test-statistics__item--icon">{icon}</span>}
        <span className="test-statistics__item--value">{value}</span>
      </div>
      <div className="test-statistics__item--label">{label}</div>
    </div>
  </GridItem>
);

export default TestStatisticsItem;
