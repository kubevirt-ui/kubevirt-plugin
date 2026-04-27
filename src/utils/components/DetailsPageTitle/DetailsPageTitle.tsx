import React, { FC, ReactNode } from 'react';

import { PageBreadcrumb, PageGroup, PageSection } from '@patternfly/react-core';

import './details-page-title.scss';

type DetailsPageTitleProps = {
  breadcrumb?: ReactNode;
  children?: ReactNode;
};

const DetailsPageTitle: FC<DetailsPageTitleProps> = ({ breadcrumb, children }) => (
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
