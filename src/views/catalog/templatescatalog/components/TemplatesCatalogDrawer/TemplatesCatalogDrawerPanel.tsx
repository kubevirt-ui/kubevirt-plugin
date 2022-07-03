import * as React from 'react';

import { WizardOverviewDisksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateFlavorData } from '@kubevirt-utils/resources/template/utils';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template/utils/constants';
import {
  getTemplateDescription,
  getTemplateDisks,
  getTemplateDocumentationURL,
  getTemplateInterfaces,
  getTemplateName,
  getTemplateNetworks,
  getTemplateVirtualMachineObject,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

type TemplatesCatalogDrawerPanelProps = {
  template: V1Template;
};

const TemplateExpandableDescription: React.FC<{ description: string }> = ({ description }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = React.useState(description?.length <= 120);
  return (
    <Stack className="template-catalog-drawer-description">
      <StackItem>
        <ExpandableSection isExpanded isDetached contentId="expandable-content">
          {isExpanded ? description : description.slice(0, 120).concat('...')}
        </ExpandableSection>
      </StackItem>
      {description.length > 120 && (
        <StackItem>
          <Button isInline variant="link" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? t('Collapse') : t('Read more')}
          </Button>
        </StackItem>
      )}
    </Stack>
  );
};

export const TemplatesCatalogDrawerPanel: React.FC<TemplatesCatalogDrawerPanelProps> = React.memo(
  ({ template }) => {
    const { t } = useKubevirtTranslation();

    const notAvailable = t('N/A');
    const vmObject = getTemplateVirtualMachineObject(template);
    const displayName = getTemplateName(template);
    const description = getTemplateDescription(template) || notAvailable;
    const documentationUrl = getTemplateDocumentationURL(template);
    const workload = getTemplateWorkload(template);
    const networks = getTemplateNetworks(template);
    const interfaces = getTemplateInterfaces(template);
    const disks = getTemplateDisks(template);
    const isDefaultTemplate = isDefaultVariantTemplate(template);
    const { memory, cpuCount } = getTemplateFlavorData(template);
    const hostDevicesCount = getHostDevices(vmObject)?.length || 0;
    const gpusCount = getGPUDevices(vmObject)?.length || 0;
    const hardwareDevicesCount = hostDevicesCount + gpusCount;

    return (
      <div className="modal-body modal-body-border modal-body-content">
        <div className="modal-body-inner-shadow-covers">
          <div className="co-catalog-page__overlay-body">
            <Stack hasGutter className="template-catalog-drawer-info">
              <StackItem>
                <Title headingLevel="h1" size="lg">
                  {t('Template info')}
                </Title>
              </StackItem>
              <StackItem>
                <Grid hasGutter>
                  <GridItem span={6}>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Operating System')}</DescriptionListTerm>
                        <DescriptionListDescription>{displayName}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Workload type')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {WORKLOADS_LABELS[workload] ?? t('Other')}{' '}
                          {isDefaultTemplate && t('(default)')}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {<TemplateExpandableDescription description={description} />}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Documentation')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {documentationUrl ? (
                            <Button
                              isSmall
                              isInline
                              variant="link"
                              icon={<ExternalLinkSquareAltIcon />}
                              iconPosition="right"
                            >
                              <a href={documentationUrl} target="_blank" rel="noopener noreferrer">
                                {t('Refer to documentation')}
                              </a>
                            </Button>
                          ) : (
                            notAvailable
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>
                  <GridItem span={6}>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('CPU | Memory')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {t('{{cpuCount}} CPU | {{memory}} Memory', {
                            cpuCount,
                            memory: readableSizeUnit(memory),
                          })}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Network interfaces')}
                          {` (${networks.length})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <WizardOverviewNetworksTable
                            networks={networks}
                            interfaces={interfaces}
                          />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Disks')}
                          {` (${disks.length})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <WizardOverviewDisksTable vm={vmObject} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Hardware devices')}
                          {` (${hardwareDevicesCount})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <HardwareDevices canEdit={false} vm={vmObject} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>
                </Grid>
              </StackItem>
            </Stack>
          </div>
        </div>
      </div>
    );
  },
);
TemplatesCatalogDrawerPanel.displayName = 'TemplatesCatalogDrawerPanel';
