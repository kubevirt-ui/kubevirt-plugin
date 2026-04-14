import React, { FC, memo, useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations, getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
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
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import './TemplatesCatalogTile.scss';

export type TemplatesCatalogTileProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  isSelected?: boolean;
  onClick: (template: V1Template) => void;
  template: V1Template;
};

const TemplatesCatalogTile: FC<TemplatesCatalogTileProps> = memo(
  ({
    availableDatasources,
    availableTemplatesUID,
    bootSourcesLoaded,
    isSelected,
    onClick,
    template,
  }) => {
    const { t } = useKubevirtTranslation();

    const isDeprecated = isDeprecatedTemplate(template);
    const workload = getTemplateWorkload(template);
    const templateID = getUID(template);
    const templateName = getName(template);
    const displayName = getTemplateName(template);
    const bootSource = getTemplateBootSourceType(template);
    const isBootSourceAvailable = availableTemplatesUID.has(template.metadata.uid);
    const dataSource =
      availableDatasources[
        `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
      ];
    const { cpuCount, memory } = getTemplateFlavorData(template);

    const icon = useMemo(() => {
      return getTemplateOSIcon(template);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAnnotations(template)?.iconClass]);

    return (
      <Card
        className="templates-catalog-tile"
        data-test-id={templateName}
        id={templateID}
        isSelectable
        isSelected={isSelected}
        onClick={() => onClick(template)}
      >
        <CardHeader
          selectableActions={{
            isHidden: true,
            name: 'template-catalog-tile',
            onChange: () => onClick(template),
            selectableActionAriaLabelledby: `template-catalog-tile-${templateName}`,
            selectableActionId: templateID,
            variant: 'single',
          }}
        >
          <Stack>
            <StackItem>
              <Split>
                {icon && (
                  <SplitItem>
                    <img alt={`${templateName} icon`} className="catalog-tile-pf-icon" src={icon} />
                  </SplitItem>
                )}
                <SplitItem isFilled />
                <SplitItem>
                  <Stack className="badge-stack" key="badge-stack">
                    {bootSourcesLoaded
                      ? isBootSourceAvailable && [
                          <Badge key="available-boot">{t('Source available')}</Badge>,
                        ]
                      : [
                          <Skeleton
                            className="badgeload"
                            height="1.125rem" // 18px
                            key="loading-sources"
                            width="6.563rem" // 105px
                          />,
                        ]}
                    {isDeprecated ? <DeprecatedBadge className="deprecated-template" /> : null}
                  </Stack>
                </SplitItem>
              </Split>
            </StackItem>
            <StackItem>
              <b>{displayName}</b>
            </StackItem>
            <StackItem className="pf-v6-u-text-color-subtle">{templateName}</StackItem>
          </Stack>
        </CardHeader>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <Stack>
                <StackItem>
                  <b>{ARCHITECTURE_TITLE}</b>{' '}
                  <ArchitectureLabel architecture={getArchitecture(template)} />
                </StackItem>
                <StackItem>
                  <b>{t('Project')}</b> {getNamespace(template)}
                </StackItem>
                <StackItem>
                  <b>{t('Boot source')}</b> {getVMBootSourceLabel(bootSource?.type, dataSource)}
                </StackItem>
                <StackItem>
                  <b>{t('Workload')}</b> {WORKLOADS_LABELS?.[workload] ?? t('Other')}
                </StackItem>
                <StackItem>
                  <Stack hasGutter>
                    <StackItem>
                      <b>{t('CPU')}</b> {cpuCount}
                    </StackItem>
                    <StackItem>
                      <b>{t('Memory')}</b> {readableSizeUnit(memory)}
                    </StackItem>
                  </Stack>
                </StackItem>
              </Stack>
            </StackItem>
          </Stack>
        </CardBody>
      </Card>
    );
  },
);

export default TemplatesCatalogTile;
