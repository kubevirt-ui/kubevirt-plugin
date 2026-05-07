import React, { FC, memo, useMemo } from 'react';

import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations, getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getTemplateFlavorData,
  getTemplateOSLabelName,
  isDeprecatedTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getTemplateArchitecture } from '@templates/utils/utils';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import './TemplatesCatalogTile.scss';

export type TemplatesCatalogTileProps = {
  isSelected?: boolean;
  onClick: (template: Template) => void;
  template: Template;
};

const TemplatesCatalogTile: FC<TemplatesCatalogTileProps> = memo(
  ({ isSelected, onClick, template }) => {
    const { t } = useKubevirtTranslation();

    const isDeprecated = isDeprecatedTemplate(template);
    const templateID = getUID(template);
    const templateName = getName(template);
    const { cpuCount, memory } = getTemplateFlavorData(template);
    const architecture = getTemplateArchitecture(template);
    const osName =
      getOperatingSystemName(template) || getTemplateOSLabelName(template) || NO_DATA_DASH;

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
                    <img
                      alt={`${templateName} icon`}
                      className="templates-catalog-tile__icon pf-v6-u-mr-sm"
                      src={icon}
                    />
                  </SplitItem>
                )}
                <SplitItem>
                  <div
                    className="pf-v6-u-font-weight-bold"
                    id={`template-catalog-tile-${templateName}`}
                  >
                    {templateName}
                  </div>
                </SplitItem>
                <SplitItem isFilled />
                <SplitItem>
                  <Stack className="badge-stack pf-v6-u-ml-xs" key="badge-stack">
                    {architecture && <Badge key="architecture">{architecture}</Badge>}
                    {isDeprecated ? <DeprecatedBadge className="deprecated-template" /> : null}
                  </Stack>
                </SplitItem>
              </Split>
            </StackItem>
          </Stack>
        </CardHeader>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <Stack>
                <StackItem>
                  <b>{t('Project')}</b> {getNamespace(template)}
                </StackItem>
                <StackItem>
                  <b>{t('OS')}</b> {osName}
                </StackItem>
                <StackItem>
                  <b>{t('vCPU | Memory')}</b> {cpuCount} | {readableSizeUnit(memory)}
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
