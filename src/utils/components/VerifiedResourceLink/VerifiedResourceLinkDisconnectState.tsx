import { type FC, type ReactNode } from 'react';

import { Flex, Tooltip } from '@patternfly/react-core';
import { RhStandardLinkBrokenIcon } from '@patternfly/react-icons';

import './verified-resource-link.scss';

type VerifiedResourceLinkDisconnectStateProps = {
  dataTest?: string;
  displayName?: string;
  name?: string;
  tooltipContent: ReactNode;
};

const VerifiedResourceLinkDisconnectState: FC<VerifiedResourceLinkDisconnectStateProps> = ({
  dataTest,
  displayName,
  name,
  tooltipContent,
}) => (
  <Tooltip content={tooltipContent}>
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      data-test={dataTest ?? 'verified-resource-link-disconnect'}
      display={{ default: 'inlineFlex' }}
      gap={{ default: 'gapSm' }}
    >
      <RhStandardLinkBrokenIcon className="pf-v6-u-text-color-disabled verified-resource-link__disconnect-icon" />
      <span className="pf-v6-u-text-color-disabled">{displayName ?? name}</span>
    </Flex>
  </Tooltip>
);

export default VerifiedResourceLinkDisconnectState;
