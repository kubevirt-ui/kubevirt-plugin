import React, { FCC, ReactNode, useState } from 'react';
import classNames from 'classnames';

import { ExpandableSection, Title } from '@patternfly/react-core';

import './OverviewSection.scss';

type OverviewSectionProps = {
  children: ReactNode;
  dataTestId: string;
  defaultExpanded?: boolean;
  subHeader?: ReactNode;
  title: string;
};

const OverviewSection: FCC<OverviewSectionProps> = ({
  children,
  dataTestId,
  defaultExpanded = true,
  subHeader,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="overview-section" data-test={dataTestId}>
      <ExpandableSection
        toggleContent={
          <div className="overview-section__toggle-header">
            <Title className="overview-section__toggle-title" headingLevel="h3">
              {title}
            </Title>
            {subHeader && <span className="overview-section__sub-header">{subHeader}</span>}
          </div>
        }
        className={classNames('overview-section__expandable', { 'pf-v6-u-mb-md': isExpanded })}
        id={dataTestId}
        isExpanded={isExpanded}
        onToggle={(_, expanded) => setIsExpanded(expanded)}
      >
        <div className="overview-section__content">{children}</div>
      </ExpandableSection>
    </div>
  );
};

export default OverviewSection;
