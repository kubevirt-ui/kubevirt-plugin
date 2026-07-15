import type { FC } from 'react';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';

import {
  NodeModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import type { NodeKind } from '@openshift-console/dynamic-plugin-sdk';
import { getVMStatuses, vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Flex, FlexItem, Icon, StackItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { getVMIFromMapper } from '@virtualmachines/utils/mappers';

import { resourcePathFromModel } from '../../../cdi-upload-provider/utils/utils';
import NodeInventoryStatusItem from './NodeInventoryStatusItem';

export const NodeInventoryItem: FC<{ obj: NodeKind }> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const nodeName = getName(obj);
  const { cluster } = useParams<{ cluster?: string }>();

  const accessibleResources = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });
  const { loaded, resources: accessibleVMs } = accessibleResources;
  const hasLoadError = Boolean(accessibleResources.loadError);

  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();

  const filteredVMs = useMemo(() => {
    if (isEmpty(accessibleVMs)) {
      return [];
    }
    return accessibleVMs.filter(
      (virtualMachine) =>
        getVMINodeName(getVMIFromMapper(vmiMapper, virtualMachine)) === nodeName &&
        getCluster(virtualMachine) === cluster,
    );
  }, [accessibleVMs, cluster, nodeName, vmiMapper]);

  const { primaryStatuses } = useMemo(() => getVMStatuses(filteredVMs || []), [filteredVMs]);

  return (
    <StackItem>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        direction={{ default: 'row' }}
        flexWrap={{ default: 'nowrap' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsLg' }}
      >
        <FlexItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            direction={{ default: 'row' }}
            flexWrap={{ default: 'nowrap' }}
            spaceItems={{ default: hasLoadError ? 'spaceItemsXs' : 'spaceItemsNone' }}
          >
            {!loaded && !hasLoadError && (
              <>
                <FlexItem>
                  <div className="skeleton-inventory" data-test-id="vm-inventory-skeleton" />
                </FlexItem>
              </>
            )}
            {hasLoadError && (
              <FlexItem>
                <Icon status="danger" title={t('Error loading virtual machines')}>
                  <ExclamationCircleIcon />
                </Icon>
              </FlexItem>
            )}
            <FlexItem>
              {!loaded || hasLoadError ? (
                t('Virtual machines')
              ) : (
                <Link
                  to={`${resourcePathFromModel(
                    NodeModel,
                    nodeName,
                  )}/workload?activeTab=virtualmachines`}
                >
                  {t('{{count}} Virtual machine', { count: filteredVMs.length })}
                </Link>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>
        {loaded && vmisLoaded && !hasLoadError ? (
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              direction={{ default: 'row' }}
              flexWrap={{ default: 'wrap' }}
              spaceItems={{ default: 'spaceItemsMd' }}
            >
              <FlexItem>
                <NodeInventoryStatusItem
                  count={primaryStatuses.Error}
                  icon={<vmStatusIcon.Error size="xl" />}
                />
              </FlexItem>
              <FlexItem>
                <NodeInventoryStatusItem
                  count={primaryStatuses.Running}
                  icon={<vmStatusIcon.Running size="xl" />}
                />
              </FlexItem>
              <FlexItem>
                <NodeInventoryStatusItem
                  count={primaryStatuses.Stopped}
                  icon={
                    <Icon size="xl">
                      <vmStatusIcon.Stopped />
                    </Icon>
                  }
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        ) : null}
      </Flex>
    </StackItem>
  );
};

export default NodeInventoryItem;
