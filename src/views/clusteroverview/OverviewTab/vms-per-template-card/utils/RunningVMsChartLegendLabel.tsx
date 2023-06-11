import * as React from 'react';
import { Link } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';

import './RunningVMsChartLegendLabel.scss';

export type RunningVMsChartLegendLabelItem = {
  color: string;
  name: string;
  namespace: string;
  vmCount: number;
};

type RunningVMsChartLegendLabelProps = {
  item: RunningVMsChartLegendLabelItem;
};

const RunningVMsChartLegendLabel: React.FC<RunningVMsChartLegendLabelProps> = ({ item }) => {
  const iconStyle = { color: item.color };
  const linkPath = `/k8s/all-namespaces/${VirtualMachineModelRef}?rowFilter-template=${item.name}`;

  return (
    <>
      <i className="fas fa-square kv-running-vms-card__legend-label--color" style={iconStyle} />
      <span className="kv-running-vms-card__legend-label--count">{item.vmCount}</span>{' '}
      <Link to={linkPath}>{item.name}</Link>
    </>
  );
};

export default RunningVMsChartLegendLabel;
