import * as React from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

export const TemplatesCatalogDrawerFooterSkeleton: React.FC = React.memo(() => (
  <Stack className="template-catalog-drawer-info" hasGutter>
    <StackItem className="template-catalog-drawer-footer-section">
      <Stack hasGutter>
        <StackItem>
          <Skeleton height="30px" width="40%" />
        </StackItem>
        <StackItem>
          <Skeleton height="20px" width="60%" />
        </StackItem>
        <StackItem />
        <StackItem>
          <Skeleton height="30px" width="30%" />
        </StackItem>
      </Stack>
    </StackItem>
  </Stack>
));
TemplatesCatalogDrawerFooterSkeleton.displayName = 'TemplatesCatalogDrawerFooterSkeleton';
