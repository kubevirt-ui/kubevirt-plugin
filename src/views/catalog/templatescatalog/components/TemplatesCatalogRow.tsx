import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateFlavorData,
  getTemplateName,
  getTemplateWorkload,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../utils/os-icons';

import TemplateRowAvailableSource from './TemplateRowAvailableSource';

import './TemplatesCatalog.scss';

export const TemplatesCatalogRow: React.FC<
  RowProps<
    V1Template,
    {
      onTemplateClick: (template: V1Template) => void;
      availableTemplatesUID: Set<string>;
      availableDatasources: Record<string, V1beta1DataSource>;
    }
  >
> = React.memo(
  ({
    obj,
    activeColumnIDs,
    rowData: { onTemplateClick, availableTemplatesUID, availableDatasources },
  }) => {
    const { t } = useKubevirtTranslation();
    const bootSource = getTemplateBootSourceType(obj);
    const { memory, cpuCount } = getTemplateFlavorData(obj);
    const workload = getTemplateWorkload(obj);
    const dataSource =
      availableDatasources[
        `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
      ];

    return (
      <>
        <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
          <img src={getTemplateOSIcon(obj)} alt="" className="vm-catalog-row-icon" />
          <Button variant="link" isInline onClick={() => onTemplateClick(obj)}>
            {getTemplateName(obj)}
          </Button>
        </TableData>
        <TableData id="workload" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
          {WORKLOADS_LABELS?.[workload]}
        </TableData>
        <TableData id="source" activeColumnIDs={activeColumnIDs}>
          <TemplateRowAvailableSource
            source={getVMBootSourceLabel(bootSource?.type, dataSource)}
            isBootSourceAvailable={availableTemplatesUID.has(obj.metadata.uid)}
          />
        </TableData>
        <TableData id="cpu" activeColumnIDs={activeColumnIDs} className="pf-m-width-30">
          {t('CPU')} {cpuCount}
          <span className="cpu-memory-divider"> | </span>
          {t('Memory')} {memory}
        </TableData>
      </>
    );
  },
);
TemplatesCatalogRow.displayName = 'TemplatesCatalogRow';
