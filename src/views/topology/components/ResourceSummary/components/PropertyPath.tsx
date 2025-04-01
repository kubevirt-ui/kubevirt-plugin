import React, { FC } from 'react';
import toPath from 'lodash.topath';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

const PropertyPath: FC<{ kind: string; path: string | string[] }> = ({ kind, path }) => {
  const pathArray: string[] = toPath(path);
  return (
    <Breadcrumb className="co-breadcrumb">
      <BreadcrumbItem>{kind}</BreadcrumbItem>
      {pathArray.map((property, i) => {
        const isLast = i === pathArray.length - 1;
        return (
          <BreadcrumbItem isActive={isLast} key={i}>
            {property}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default PropertyPath;
