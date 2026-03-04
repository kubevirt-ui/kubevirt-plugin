import React, { FC } from 'react';

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
  /** Widget configs to populate the dropdown options. */
  widgetConfigs: WidgetConfig[];
};

const ResourceAllocationSubHeader: FC<ResourceAllocationSubHeaderProps> = ({
  isAllClusters,
  onDropdownChange,
  selectedMetric,
  widgetConfigs,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedLabel = widgetConfigs.find((w) => w.metric === selectedMetric)?.title ?? '';

  return (
    <span className="resource-allocation-sub-header" onClick={(e) => e.stopPropagation()}>
      {isAllClusters && (
        <span className="resource-allocation-sub-header__all-clusters">
          {/* TODO CNV-78882: Implement navigation to all clusters view and add ViewAllLink */}
          <span className="resource-allocation-sub-header__top-clusters">
            <span className="resource-allocation-sub-header__top-clusters-label">
              {t('Top {{clustersCount}} clusters by', { clustersCount: TOP_N })}
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
