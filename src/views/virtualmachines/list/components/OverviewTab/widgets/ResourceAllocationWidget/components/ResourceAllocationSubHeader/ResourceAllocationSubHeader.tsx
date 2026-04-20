import React, { FCC } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SelectOption } from '@patternfly/react-core';

import { TOP_N } from '../../../ClusterStatusWidget/hooks/clusterMetricConstants';
import { WidgetConfig } from '../ResourceAllocationSection/resourceAllocationSectionConfig';

import './ResourceAllocationSubHeader.scss';

type ResourceAllocationSubHeaderProps = {
  /** Whether to show the all-clusters controls (link + dropdown). */
  isAllClusters?: boolean;
  /** Callback when the dropdown selection changes (receives METRICS value). */
  onDropdownChange?: (metric: string) => void;
  /** Currently selected METRICS value. */
  selectedMetric?: string;
  /** Number of top cluster names returned (used to decide whether to show the count). */
  topClusterCount?: number;
  /** Widget configs to populate the dropdown options. */
  widgetConfigs: WidgetConfig[];
};

const ResourceAllocationSubHeader: FCC<ResourceAllocationSubHeaderProps> = ({
  isAllClusters,
  onDropdownChange,
  selectedMetric,
  topClusterCount = 0,
  widgetConfigs,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedLabel = widgetConfigs.find((w) => w.metric === selectedMetric)?.title ?? '';
  const showCount = topClusterCount >= TOP_N;

  return (
    <span className="resource-allocation-sub-header">
      {isAllClusters && (
        <span
          className="resource-allocation-sub-header__all-clusters"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="resource-allocation-sub-header__top-clusters">
            <span className="resource-allocation-sub-header__top-clusters-label">
              {showCount
                ? t('Top {{clustersCount}} clusters by', { clustersCount: TOP_N })
                : t('Top clusters by')}
            </span>
            <FormPFSelect
              onSelect={(_event, value) => onDropdownChange?.(value as string)}
              selected={selectedMetric}
              selectedLabel={selectedLabel}
              toggleProps={{ className: 'resource-allocation-sub-header__select-toggle' }}
            >
              {widgetConfigs.map((config) => (
                <SelectOption key={config.metric} value={config.metric}>
                  {config.title}
                </SelectOption>
              ))}
            </FormPFSelect>
          </span>
        </span>
      )}
      <span className="resource-allocation-sub-header__time-range">
        <span className="resource-allocation-sub-header__time-range-label">{t('Time range')}</span>
        {t('Last week')}
      </span>
    </span>
  );
};

export default ResourceAllocationSubHeader;
