import type { FC, MouseEvent } from 'react';

import { useOpenLinksInNewTab } from '@kubevirt-utils/components/OpenLinksInNewTabContext/OpenLinksInNewTabContext';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FleetResourceLinkProps } from '@stolostron/multicluster-sdk';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

const handleClickCapture = (event: MouseEvent): void => {
  // Allow non-primary clicks (middle click, right click) and modified keys through
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const anchor = (event.target as HTMLElement).closest('a');
  if (!anchor?.href) {
    return;
  }

  // Prevent internal React Router navigation, but let event bubble for analytics/parents
  event.preventDefault();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
};

const MulticlusterResourceLink: FC<FleetResourceLinkProps> = (props) => {
  const openInNewTab = useOpenLinksInNewTab();

  const ResourceComponent = props?.cluster ? FleetResourceLink : ResourceLink;
  const content = <ResourceComponent {...props} />;

  if (!openInNewTab) {
    return content;
  }

  return (
    <span
      aria-description="Opens in a new tab"
      onClickCapture={handleClickCapture}
      style={{ display: 'contents' }}
    >
      {content}
    </span>
  );
};

export default MulticlusterResourceLink;
