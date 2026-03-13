import React, { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useIsSpokeCluster, useSettingsCluster } from './SettingsClusterContext';

type SettingsLinkProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  forceExternal?: boolean;
  isInline?: boolean;
  showExternalIcon?: boolean;
  to?: string;
};

const SettingsLink: FC<SettingsLinkProps> = ({
  children,
  className,
  disabled,
  forceExternal,
  isInline = true,
  showExternalIcon,
  to,
}) => {
  const navigate = useNavigate();
  const cluster = useSettingsCluster();
  const isSpokeCluster = useIsSpokeCluster();
  const { getConsoleURL } = useManagedClusterConsoleURLs();

  if (isSpokeCluster || forceExternal) {
    const href = isSpokeCluster ? `${getConsoleURL(cluster)}${to}` : to;
    return (
      <Button
        className={className}
        component="a"
        href={href}
        icon={showExternalIcon ? <ExternalLinkAltIcon /> : null}
        iconPosition="end"
        isDisabled={disabled}
        isInline={isInline}
        rel="noopener noreferrer"
        target="_blank"
        variant="link"
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      isDisabled={disabled}
      isInline={isInline}
      onClick={() => navigate(to)}
      variant="link"
    >
      {children}
    </Button>
  );
};

export default SettingsLink;
