import React, { FCC, memo, useMemo } from 'react';

import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations, getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getTemplateFlavorData,
  isDeprecatedTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
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
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import './TemplatesCatalogTile.scss';

export type TemplatesCatalogTileProps = {
  isSelected?: boolean;
  onClick: (template: Template) => void;
  template: Template;
};

const TemplatesCatalogTile: FCC<TemplatesCatalogTileProps> = memo(
  ({ isSelected, onClick, template }) => {
    const { t } = useKubevirtTranslation();

    const isDeprecated = isDeprecatedTemplate(template);
    const templateID = getUID(template);
    const templateName = getName(template);
    const displayName = getTemplateName(template);
    const { cpuCount, memory } = getTemplateFlavorData(template);
    const architecture = getArchitecture(template);

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
                  <div className="pf-v6-u-font-weight-bold">{displayName}</div>
                </SplitItem>
                <SplitItem isFilled />
                <SplitItem>
                  <Stack className="badge-stack pf-v6-u-ml-xs" key="badge-stack">
                    {architecture && <Badge key="architecture">{getArchitecture(template)}</Badge>}
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
                  <b>{t('OS')}</b> {displayName}
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
