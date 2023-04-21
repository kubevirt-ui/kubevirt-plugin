import React, { FC } from 'react';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  href: string;
  text?: React.ReactNode;
  className?: string;
  dataTestID?: string;
  stopPropagation?: boolean;
};

const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  href,
  text,
  className = '',
  dataTestID,
  stopPropagation,
}) => (
  <a
    className={className}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-test-id={dataTestID}
    {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
  >
    {children || text} <ExternalLinkAltIcon />
  </a>
);

export default ExternalLink;
