import React, { CSSProperties, FCC, ReactNode } from 'react';
import classNames from 'classnames';

import './OverviewSection.scss';

type OverviewSectionRowProps = {
  children: ReactNode;
  className?: string;
  gridColumns?: string;
};

const OverviewSectionRow: FCC<OverviewSectionRowProps> = ({ children, className, gridColumns }) => {
  const rowStyle: CSSProperties | undefined = gridColumns
    ? ({ '--overview-row-columns': gridColumns } as CSSProperties)
    : undefined;

  return (
    <div className={classNames('overview-section__row', className)} style={rowStyle}>
      {children}
    </div>
  );
};

export default OverviewSectionRow;
