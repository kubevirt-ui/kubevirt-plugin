import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
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

export const TemplatesCatalogRow: React.FC<
  RowProps<
    V1Template,
    { onTemplateClick: (template: V1Template) => void; availableTemplatesUID: Set<string> }
  >
> = React.memo(({ obj, activeColumnIDs, rowData: { onTemplateClick, availableTemplatesUID } }) => {
  const { t } = useKubevirtTranslation();
  const bootSourceType = getTemplateBootSourceType(obj)?.type;
  const { memory, cpuCount } = getTemplateFlavorData(obj);
  const workload = getTemplateWorkload(obj);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <img src={getTemplateOSIcon(obj)} alt="" className="vm-catalog-row-icon" />
        <Button variant="link" isInline onClick={() => onTemplateClick(obj)}>
          {getTemplateName(obj)}
        </Button>
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {getVMBootSourceLabel(bootSourceType)}
      </TableData>
      <TableData id="workload" activeColumnIDs={activeColumnIDs}>
        {WORKLOADS_LABELS?.[workload]}
      </TableData>
      <TableData id="availability" activeColumnIDs={activeColumnIDs}>
        <TemplateRowAvailableSource
          isBootSourceAvailable={availableTemplatesUID.has(obj.metadata.uid)}
        />
      </TableData>
      <TableData id="cpu" activeColumnIDs={activeColumnIDs}>
        {t('CPU')} {cpuCount} | {t('Memory')} {memory}
      </TableData>
    </>
  );
});
TemplatesCatalogRow.displayName = 'TemplatesCatalogRow';
