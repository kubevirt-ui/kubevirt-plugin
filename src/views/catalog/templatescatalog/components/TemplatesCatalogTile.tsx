import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CatalogTile } from '@patternfly/react-catalog-view-extension';
import { Stack, StackItem } from '@patternfly/react-core';

import { getTemplateName } from '../../utils/templateGetters';
import {
  BOOT_SOURCE_LABELS,
  getTemplateBootSourceType,
} from '../../utils/vm-template-source/utils';
import { WORKLOADS_LABELS } from '../utils/constants';
import { getFlavorData } from '../utils/flavor';
import { getTemplateProviderName, getTemplateWorkload } from '../utils/helpers';
import { getTemplateOSIcon } from '../utils/os-icons';

export type TemplateTileProps = {
  template: V1Template;
  onClick: (template: V1Template) => void;
  isSelected?: boolean;
};

export const TemplateTile: React.FC<TemplateTileProps> = React.memo(({ template, onClick }) => {
  const { t } = useKubevirtTranslation();

  const provider = getTemplateProviderName(template);
  const workload = getTemplateWorkload(template);
  const displayName = getTemplateName(template);
  const bootSourceType = getTemplateBootSourceType(template)?.type;
  const { memory, cpuCount } = getFlavorData(template);

  return (
    <CatalogTile
      className="vm-catalog-grid-tile"
      data-test-id={template.metadata.name}
      icon={<img src={getTemplateOSIcon(template)} alt="os-icon" />}
      title={
        <Stack>
          <StackItem>
            <b>{displayName}</b>
          </StackItem>
          {provider && <StackItem className="text-secondary">{template.metadata.name}</StackItem>}
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
              <b>{t('Workload')}</b> {WORKLOADS_LABELS?.[workload]}
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
