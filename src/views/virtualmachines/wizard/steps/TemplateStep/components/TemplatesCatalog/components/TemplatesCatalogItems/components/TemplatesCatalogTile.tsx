import { type FC, memo } from 'react';

import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import {
  getTemplateCategoryDisplay,
  getTemplateFlavorData,
  isDeprecatedTemplate,
  isVirtualMachineTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
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
import { getTemplateOSName } from '@virtualmachines/wizard/steps/TemplateStep/utils/getTemplateOSName';
import { getTemplateOSIcon } from '@virtualmachines/wizard/utils/os-icons/os-icons';

import './TemplatesCatalogTile.scss';

export type TemplatesCatalogTileProps = {
  clusterPreference: null | V1beta1VirtualMachineClusterPreference;
  isSelected?: boolean;
  onClick: (template: Template) => void;
  osDisplayNames: Record<string, string>;
  template: Template;
};

const TemplatesCatalogTile: FC<TemplatesCatalogTileProps> = memo(
  ({ clusterPreference, isSelected, onClick, osDisplayNames, template }) => {
    const { t } = useKubevirtTranslation();

    const isDeprecated = isDeprecatedTemplate(template);
    const templateID = getUID(template);
    const templateName = getName(template);
    const { cpuCount, memory } = getTemplateFlavorData(template);
    const architecture = getTemplateArchitecture(template);
    const osName = getTemplateOSName(template, clusterPreference, osDisplayNames) ?? NO_DATA_DASH;
    const icon = getTemplateOSIcon(template, clusterPreference);

    return (
      <Card
        className="templates-catalog-tile"
        data-test={templateName}
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
                {isVirtualMachineTemplate(template) && (
                  <StackItem>
                    <b>{t('Category')}</b> {getTemplateCategoryDisplay(template, t)}
                  </StackItem>
                )}
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
