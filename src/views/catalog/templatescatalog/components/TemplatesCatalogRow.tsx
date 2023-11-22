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
      availableDatasources: Record<string, V1beta1DataSource>;
      availableTemplatesUID: Set<string>;
      onTemplateClick: (template: V1Template) => void;
    }
  >
> = React.memo(
  ({
    activeColumnIDs,
    obj,
    rowData: { availableDatasources, availableTemplatesUID, onTemplateClick },
  }) => {
    const { t } = useKubevirtTranslation();
    const bootSource = getTemplateBootSourceType(obj);
    const { cpuCount, memory } = getTemplateFlavorData(obj);
    const workload = getTemplateWorkload(obj);
    const dataSource =
      availableDatasources[
        `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
      ];

    return (
      <>
        <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-40" id="name">
          <img alt="" className="vm-catalog-row-icon" src={getTemplateOSIcon(obj)} />
          <Button isInline onClick={() => onTemplateClick(obj)} variant="link">
            {getTemplateName(obj)}{' '}
            {!isEmpty(getAnnotation(obj, ANNOTATIONS.displayName)) && (
              <Label isCompact variant="outline">
                {getName(obj)}
              </Label>
            )}
          </Button>
        </TableData>
        <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="workload">
          {WORKLOADS_LABELS?.[workload]}
        </TableData>
        <TableData activeColumnIDs={activeColumnIDs} id="source">
          <TemplateRowAvailableSource
            isBootSourceAvailable={availableTemplatesUID.has(obj.metadata.uid)}
            source={getVMBootSourceLabel(bootSource?.type, dataSource)}
          />
        </TableData>
        <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="cpu">
          {t('CPU')} {cpuCount} | {t('Memory')} {readableSizeUnit(memory)}
        </TableData>
      </>
    );
  },
);
TemplatesCatalogRow.displayName = 'TemplatesCatalogRow';
