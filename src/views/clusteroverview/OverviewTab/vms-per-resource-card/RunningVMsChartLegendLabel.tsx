import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { getInstanceTypeSeriesLabel, getLinkPath } from './utils/utils';

import './RunningVMsChartLegendLabel.scss';

export type RunningVMsChartLegendLabelItem = {
  color: string;
  isInstanceType: boolean;
  name: string;
  namespace: string;
  percentage: number;
  templateNamespace?: string;
  type: string;
  vmCount: number;
};

type RunningVMsChartLegendLabelProps = {
  item: RunningVMsChartLegendLabelItem;
};

const RunningVMsChartLegendLabel: React.FC<RunningVMsChartLegendLabelProps> = ({ item }) => {
  const [activeNamespace] = useActiveNamespace();
  const iconStyle = { color: item.color };
  const linkPath = getLinkPath(item, activeNamespace);
  const linkText = item?.isInstanceType ? getInstanceTypeSeriesLabel(item.name) : item?.name;

  return (
    <>
      <i className="fas fa-square kv-running-vms-card__legend-label--color" style={iconStyle} />
      <span className="kv-running-vms-card__legend-label--count">{item.vmCount}</span>{' '}
      <Link id="link-to-vm-list" to={linkPath}>
        {linkText}
      </Link>
    </>
  );
};

export default RunningVMsChartLegendLabel;
