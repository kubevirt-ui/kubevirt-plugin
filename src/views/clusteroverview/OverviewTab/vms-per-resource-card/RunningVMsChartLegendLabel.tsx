import * as React from 'react';
import { Link } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';

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
  const iconStyle = { color: item.color };
  const filterKey = item.isInstanceType ? 'instanceType' : 'template';
  const linkPath = `/k8s/all-namespaces/${VirtualMachineModelRef}?rowFilter-${filterKey}=${getInstanceTypePrefix(
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
