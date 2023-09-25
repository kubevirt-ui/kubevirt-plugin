import React, { FC } from 'react';

import { CustomizeError } from '@catalog/customize/components/CustomizeError';
import { CustomizeVirtualMachineSkeleton } from '@catalog/customize/components/CustomizeVirtualMachineSkeleton';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateDescription,
  getTemplateDocumentationURL,
  getTemplateName,
  getTemplateWorkload,
  isDefaultVariantTemplate,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import useVMTemplateGeneratedParams from '@kubevirt-utils/resources/template/hooks/useVMTemplateGeneratedParams';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

import TemplateExpandableDescription from './TemplateExpandableDescription';

type TemplatesCatalogDrawerLeftColumnProps = {
  template: V1Template;
};

const TemplatesCatalogDrawerLeftColumn: FC<TemplatesCatalogDrawerLeftColumnProps> = ({
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const [templateWithGeneratedValues, processError] = useVMTemplateGeneratedParams(template);

  const notAvailable = t('N/A');
  const description = getTemplateDescription(template) || notAvailable;
  const displayName = getTemplateName(template);
  const documentationUrl = getTemplateDocumentationURL(template);
  const isDefaultTemplate = isDefaultVariantTemplate(template);
  const workload = getTemplateWorkload(template);

  if (processError) return <CustomizeError />;

  if (!templateWithGeneratedValues) return <CustomizeVirtualMachineSkeleton />;

  return (
    <>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
          <DescriptionListDescription>{displayName}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Workload type')}</DescriptionListTerm>
          <DescriptionListDescription>
            {WORKLOADS_LABELS[workload] ?? t('Other')} {isDefaultTemplate && t('(default)')}
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
                icon={<ExternalLinkSquareAltIcon />}
                iconPosition="right"
                isInline
                isSmall
                variant="link"
              >
                <a href={documentationUrl} rel="noopener noreferrer" target="_blank">
                  {t('Refer to documentation')}
                </a>
              </Button>
            ) : (
              notAvailable
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <AdditionalResources template={template} />
      </DescriptionList>
    </>
  );
};

export default TemplatesCatalogDrawerLeftColumn;
