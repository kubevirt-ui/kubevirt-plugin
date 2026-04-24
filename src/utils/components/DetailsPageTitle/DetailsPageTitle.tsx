import React, { FCC, ReactNode } from 'react';

import { PageBreadcrumb, PageGroup, PageSection } from '@patternfly/react-core';

import './details-page-title.scss';

type DetailsPageTitleProps = {
  breadcrumb?: ReactNode;
};

const DetailsPageTitle: FCC<DetailsPageTitleProps> = ({ breadcrumb, children }) => (
  <div>
    <PageGroup>
      <PageBreadcrumb>{breadcrumb}</PageBreadcrumb>
      <PageSection className="details-page-title" hasBodyWrapper={false}>
        {children}
      </PageSection>
    </PageGroup>
  </div>
);

export default DetailsPageTitle;
