import React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GetQuery,
  Humanize,
  RedExclamationCircleIcon,
  TopConsumerPopoverProps,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';

export const getUtilizationQuery: GetQuery = () =>
  `
    sum by (instance)(((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) + (node_memory_SwapTotal_bytes - node_memory_SwapFree_bytes)) / node_memory_MemTotal_bytes) *100
  `;

export const PopoverNodeOvercommit = (props: TopConsumerPopoverProps) => {
  const { t } = useKubevirtTranslation();
  const value = parseInt(props.current);

  const error = value > 105;
  const warning = value > 95 && !error;

  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            {t(
              "To improve resource utilization you can assign more memory to the VM than the node's physical memory. Please note it requires careful management and monitoring to avoid performance issues and system instability",
            )}
          </StackItem>
          <ExternalLink
            href={'https://www.redhat.com/sysadmin/automate-linux-tasks-cron'}
            text={t('Learn about Memory overcommit')}
          />
        </Stack>
      }
      aria-label="To improve resource utilization you can assign more memory to the VM than the node's physical memory. Please note it requires careful management and monitoring to avoid performance issues and system instability"
      position={PopoverPosition.top}
    >
      <Button aria-label="Open popup" isInline variant="link">
        {props.current} {error && <RedExclamationCircleIcon />}{' '}
        {warning && <YellowExclamationTriangleIcon />}
      </Button>
    </Popover>
  );
};

export const humanize: Humanize = (val) => {
  const value = Number.parseInt(`${val}`);
  return {
    string: `${value}%`,
    unit: '',
    value,
  };
};
