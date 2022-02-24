import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import {
  getTemplateDescription,
  getTemplateDocumentationURL,
  getTemplateName,
} from '../../../utils/templateGetters';
import { WORKLOADS_LABELS } from '../../utils/constants';
import { getFlavorData } from '../../utils/flavor';
import {
  getTemplateDisks,
  getTemplateNetworkInterfaces,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '../../utils/helpers';

type TemplatesCatalogDrawerPanelProps = {
  template: V1Template;
};

const TemplateDisksTable: React.FC<{ disks: V1Disk[] }> = ({ disks }) => {
  return (
    <DescriptionList isCompact isHorizontal>
      {disks.map((disk) => (
        <DescriptionListGroup key={disk.name}>
          <DescriptionListTerm>{disk.name}</DescriptionListTerm>
          <DescriptionListDescription>{disk?.disk?.bus}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
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
    const displayName = getTemplateName(template);
    const description = getTemplateDescription(template) || notAvailable;
    const documentationUrl = getTemplateDocumentationURL(template) || notAvailable;
    const workload = getTemplateWorkload(template);
    const networkInterfaces = getTemplateNetworkInterfaces(template);
    const disks = getTemplateDisks(template);
    const isDefaultTemplate = isDefaultVariantTemplate(template);
    const { memory, cpuCount } = getFlavorData(template);

    return (
      <div className="modal-body modal-body-border">
        <div className="modal-body-content">
          <div className="modal-body-inner-shadow-covers">
            <div className="co-catalog-page__overlay-body">
              <Stack hasGutter className="template-catalog-drawer-info">
                <StackItem>
                  <Title headingLevel="h1" size="lg">
                    {t('Template info')}
                  </Title>
                </StackItem>
                <StackItem>
                  <DescriptionList
                    columnModifier={{
                      default: '2Col',
                    }}
                  >
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Operating System')}</DescriptionListTerm>
                      <DescriptionListDescription>{displayName}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('CPU | Memory')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {t('{{cpuCount}} CPU | {{memory}} Memory', { cpuCount, memory })}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Workload type')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {WORKLOADS_LABELS[workload] ?? t('Other')}{' '}
                        {isDefaultTemplate && t('(default)')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>
                        {t('Network interfaces')}
                        {` (${networkInterfaces.length})`}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {networkInterfaces.map((n) => n.name).join(', ')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {<TemplateExpandableDescription description={description} />}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup className="template-catalog-drawer-disks">
                      <DescriptionListTerm>
                        {t('Disks')}
                        {` (${disks.length})`}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        <TemplateDisksTable disks={disks} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Documentation')}</DescriptionListTerm>
                      <DescriptionListDescription>
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
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </StackItem>
              </Stack>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
TemplatesCatalogDrawerPanel.displayName = 'TemplatesCatalogDrawerPanel';
