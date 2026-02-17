import React, { FC } from 'react';
import { isEmpty } from 'lodash';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

type BreadcrumbsProps = {
  breadcrumb: string;
};

const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumb }) => {
  if (isEmpty(breadcrumb)) return null;

  return (
    <Breadcrumb>
      {breadcrumb.split('.').map((item) => (
        <BreadcrumbItem key={item}>{item}</BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
