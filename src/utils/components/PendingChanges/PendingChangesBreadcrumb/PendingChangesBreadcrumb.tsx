import * as React from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem, ListItem } from '@patternfly/react-core';

import { PendingChange } from '../utils/types';

type PendingChangesBreadcrumbProps = {
  pendingChanges: PendingChange[];
};

const PendingChangesBreadcrumb: React.FC<PendingChangesBreadcrumbProps> = ({ pendingChanges }) => {
  if (isEmpty(pendingChanges)) {
    return null;
  }

  return (
    <ListItem>
      <Breadcrumb>
        <BreadcrumbHeading>{pendingChanges?.[0]?.tabLabel}</BreadcrumbHeading>
        <BreadcrumbItem style={{ marginTop: 0 }}>
          {pendingChanges?.map(({ label, handleAction }, index) => (
            <>
              {index !== 0 && <div style={{ marginRight: '8px' }}>,</div>}
              <a key={label} onClick={handleAction}>
                {label}
              </a>
            </>
          ))}
        </BreadcrumbItem>
      </Breadcrumb>
    </ListItem>
  );
};

export default PendingChangesBreadcrumb;
