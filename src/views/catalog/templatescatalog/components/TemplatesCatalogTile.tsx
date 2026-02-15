import * as React from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateFlavorData,
  isDeprecatedTemplate,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  getTemplateName,
  getTemplateWorkload,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { ARCHITECTURE_TITLE, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { CatalogTile } from '@patternfly/react-catalog-view-extension';
import { Badge, Skeleton, Stack, StackItem } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../utils/os-icons';

export type TemplateTileProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  isSelected?: boolean;
  onClick: (template: V1Template) => void;
  template: V1Template;
};

export const TemplateTile: React.FC<TemplateTileProps> = React.memo(
  ({ availableDatasources, availableTemplatesUID, bootSourcesLoaded, onClick, template }) => {
    const { t } = useKubevirtTranslation();

    const isDeprecated = isDeprecatedTemplate(template);
    const workload = getTemplateWorkload(template);
    const displayName = getTemplateName(template);
    const bootSource = getTemplateBootSourceType(template);
    const isBootSourceAvailable = availableTemplatesUID.has(template.metadata.uid);
    const dataSource =
      availableDatasources[
        `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
      ];
    const { cpuCount, memory } = getTemplateFlavorData(template);

    const icon = React.useMemo(() => {
      return getTemplateOSIcon(template);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template?.metadata?.annotations?.iconClass]);

    return (
      <div onClick={() => onClick(template)}>
        <CatalogTile
          badges={[
            <Stack className="badge-stack" key="badge-stack">
              {bootSourcesLoaded
                ? isBootSourceAvailable && [
                    <Badge key="available-boot">{t('Source available')}</Badge>,
                  ]
                : [
                    <Skeleton
                      className="badgeload"
                      height="18px"
                      key="loading-sources"
                      width="105px"
                    />,
                  ]}
              {isDeprecated ? <DeprecatedBadge className="deprecated-template" /> : null}
            </Stack>,
          ]}
          title={
            <Stack>
              <StackItem>
                <b>{displayName}</b>
              </StackItem>
              <StackItem className="pf-v6-u-text-color-subtle">{template.metadata.name}</StackItem>
            </Stack>
          }
          className="vm-catalog-grid-tile"
          data-test-id={template.metadata.name}
          iconImg={icon}
        >
          <Stack hasGutter>
            <StackItem>
              <Stack>
                <StackItem>
                  <b>{ARCHITECTURE_TITLE}</b>{' '}
                  <ArchitectureLabel architecture={getArchitecture(template)} />
                </StackItem>
                <StackItem>
                  <b>{t('Project')}</b> {template.metadata.namespace}
                </StackItem>
                <StackItem>
                  <b>{t('Boot source')}</b> {getVMBootSourceLabel(bootSource?.type, dataSource)}
                </StackItem>
                <StackItem>
                  <b>{t('Workload')}</b> {WORKLOADS_LABELS?.[workload] || t('Other')}
                </StackItem>
                <StackItem>
                  <StackItem>
                    <b>{t('CPU')}</b> {cpuCount}
                  </StackItem>
                  <StackItem>
                    <b>{t('Memory')}</b> {readableSizeUnit(memory)}
                  </StackItem>
                </StackItem>
              </Stack>
            </StackItem>
          </Stack>
        </CatalogTile>
      </div>
    );
  },
);
