import * as React from 'react';
import { Link } from 'react-router-dom';

import './RunningVMsChartLegendLabel.scss';

export type RunningVMsChartLegendLabelItem = {
  name: string;
  vmCount: number;
  color: string;
  namespace: string;
};

type RunningVMsChartLegendLabelProps = {
  item: RunningVMsChartLegendLabelItem;
};

const RunningVMsChartLegendLabel: React.FC<RunningVMsChartLegendLabelProps> = ({ item }) => {
  const iconStyle = { color: item.color };
  const linkPath = `/k8s/ns/${item.namespace}/templates/${item.name}`;

  return (
    <>
      <i className="fas fa-square kv-running-vms-card__legend-label--color" style={iconStyle} />
      <span className="kv-running-vms-card__legend-label--count">{item.vmCount}</span>{' '}
      <Link to={linkPath}>{item.name}</Link>
    </>
  );
};

export default RunningVMsChartLegendLabel;
