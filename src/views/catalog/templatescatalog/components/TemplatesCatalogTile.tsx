import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BOOT_SOURCE_LABELS,
  getTemplateFlavorData,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  getTemplateName,
  getTemplateWorkload,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogTile } from '@patternfly/react-catalog-view-extension';
import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../utils/os-icons';

export type TemplateTileProps = {
  template: V1Template;
  onClick: (template: V1Template) => void;
  isSelected?: boolean;
};

export const TemplateTile: React.FC<TemplateTileProps> = React.memo(({ template, onClick }) => {
  const { t } = useKubevirtTranslation();
  const [iconLoaded, setIconLoaded] = React.useState(false);

  const workload = getTemplateWorkload(template);
  const displayName = getTemplateName(template);
  const bootSourceType = getTemplateBootSourceType(template)?.type;
  const { memory, cpuCount } = getTemplateFlavorData(template);

  const icon = React.useMemo(() => {
    return getTemplateOSIcon(template);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.metadata?.annotations?.iconClass]);

  return (
    <CatalogTile
      className="vm-catalog-grid-tile"
      data-test-id={template.metadata.name}
      icon={
        <div>
          {!iconLoaded && <Skeleton shape="circle" width="40px" height="40px" />}
          <img src={icon} alt="os-icon" onLoad={() => setIconLoaded(true)} />
        </div>
      }
      title={
        <Stack>
          <StackItem>
            <b>{displayName}</b>
          </StackItem>
          <StackItem className="text-secondary">{template.metadata.name}</StackItem>
        </Stack>
      }
      onClick={() => onClick(template)}
    >
      <Stack hasGutter>
        <StackItem>
          <Stack>
            <StackItem>
              <b>{t('Project')}</b> {template.metadata.namespace}
            </StackItem>
            <StackItem>
              <b>{t('Boot source')}</b> {BOOT_SOURCE_LABELS?.[bootSourceType] || 'N/A'}
            </StackItem>
            <StackItem>
              <b>{t('Workload')}</b> {WORKLOADS_LABELS?.[workload] ?? t('Other')}
            </StackItem>
            <StackItem>
              <b>{t('CPU')}</b> {cpuCount} | <b>{t('Memory')}</b> {memory}
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </CatalogTile>
  );
});
