import React, { type FC, Fragment } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem, ListItem } from '@patternfly/react-core';

import { type PendingChange } from '../utils/types';

type PendingChangesBreadcrumbProps = {
  pendingChanges: PendingChange[];
};

const PendingChangesBreadcrumb: FC<PendingChangesBreadcrumbProps> = ({ pendingChanges }) => {
  if (isEmpty(pendingChanges)) {
    return null;
  }

  return (
    <ListItem>
      <Breadcrumb>
        <BreadcrumbHeading>{pendingChanges?.[0]?.tabLabel}</BreadcrumbHeading>
        <BreadcrumbItem style={{ marginTop: 0 }}>
          {pendingChanges?.map(({ handleAction, label }, index) => (
            <Fragment key={label}>
              {index !== 0 && <div style={{ marginRight: '8px' }}>,</div>}
              <a onClick={handleAction}>{label}</a>
            </Fragment>
          ))}
        </BreadcrumbItem>
      </Breadcrumb>
    </ListItem>
  );
};

export default PendingChangesBreadcrumb;
