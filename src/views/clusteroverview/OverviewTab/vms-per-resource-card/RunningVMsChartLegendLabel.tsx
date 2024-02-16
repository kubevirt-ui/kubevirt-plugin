import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { getInstanceTypeSeriesLabel } from './utils/utils';

import './RunningVMsChartLegendLabel.scss';

export type RunningVMsChartLegendLabelItem = {
  color: string;
  isInstanceType: boolean;
  name: string;
  namespace: string;
  percentage: number;
  templateNamespace?: string;
  vmCount: number;
};

type RunningVMsChartLegendLabelProps = {
  item: RunningVMsChartLegendLabelItem;
};

const RunningVMsChartLegendLabel: React.FC<RunningVMsChartLegendLabelProps> = ({ item }) => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = isAllNamespaces(activeNamespace) ? ALL_NAMESPACES : `ns/${activeNamespace}`;
  const iconStyle = { color: item.color };
  const filterKey = item.isInstanceType ? 'instanceType' : 'template';
  const linkPath = `/k8s/${namespace}/${VirtualMachineModelRef}?rowFilter-${filterKey}=${getInstanceTypePrefix(
    item.name,
  )}`;

  return (
    <>
      <i className="fas fa-square kv-running-vms-card__legend-label--color" style={iconStyle} />
      <span className="kv-running-vms-card__legend-label--count">{item.vmCount}</span>{' '}
      <Link to={linkPath}>{getInstanceTypeSeriesLabel(item.name)}</Link>
    </>
  );
};

export default RunningVMsChartLegendLabel;
