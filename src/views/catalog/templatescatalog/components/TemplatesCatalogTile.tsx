import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { CatalogTile } from '@patternfly/react-catalog-view-extension';
import { capitalize, Stack, StackItem } from '@patternfly/react-core';

import { WORKLOADS_LABELS } from '../utils/constants';
import {
  getTemplateFlavor,
  getTemplateName,
  getTemplateProviderName,
  getTemplateWorkload,
} from '../utils/helpers';
import { getTemplateOSIcon } from '../utils/os-icons';

export type TemplateTileProps = {
  template: V1Template;
  onClick: (template: V1Template) => void;
  isSelected?: boolean;
};

export const TemplateTile: React.FC<TemplateTileProps> = React.memo(({ template, onClick }) => {
  const { t } = useTranslation();

  const provider = getTemplateProviderName(template);
  const workload = getTemplateWorkload(template);
  const flavor = getTemplateFlavor(template);

  return (
    <CatalogTile
      data-test-id={template.metadata.name}
      featured={false}
      icon={<img src={getTemplateOSIcon(template)} alt="os-icon" />}
      title={
        <Stack>
          <StackItem>
            <b>{getTemplateName(template)}</b>
          </StackItem>
          {provider && <StackItem className="text-secondary">{provider}</StackItem>}
        </Stack>
      }
      onClick={() => onClick(template)}
    >
      <Stack hasGutter className="kv-select-template__tile-desc">
        {<StackItem>{getTemplateName(template)}</StackItem>}
        <StackItem>
          <Stack>
            <StackItem>
              <b>{t('Project')}</b> {template.metadata.namespace}
            </StackItem>
            <StackItem>
              <b>{t('Storage')}</b>
            </StackItem>
            <StackItem>
              <b>{t('Workload')}</b> {WORKLOADS_LABELS?.[workload]}
            </StackItem>
            <StackItem>
              <b>{t('Flavor')}</b> {capitalize(flavor)}
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </CatalogTile>
  );
});
