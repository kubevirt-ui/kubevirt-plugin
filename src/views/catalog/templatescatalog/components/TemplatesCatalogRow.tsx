import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateFlavorData,
  getTemplateName,
  getTemplateWorkload,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Label } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../utils/os-icons';

import TemplateRowAvailableSource from './TemplateRowAvailableSource/TemplateRowAvailableSource';

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
        <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-40">
          <img src={getTemplateOSIcon(obj)} alt="" className="vm-catalog-row-icon" />
          <Button variant="link" isInline onClick={() => onTemplateClick(obj)}>
            {getTemplateName(obj)}{' '}
            {!isEmpty(getAnnotation(obj, ANNOTATIONS.displayName)) && (
              <Label isCompact variant="outline">
                {getName(obj)}
              </Label>
            )}
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
        <TableData id="cpu" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
          {t('CPU')} {cpuCount} | {t('Memory')} {readableSizeUnit(memory)}
        </TableData>
      </>
    );
  },
);
TemplatesCatalogRow.displayName = 'TemplatesCatalogRow';
