import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';

export const WizardHeader: React.FC<{ namespace: string }> = React.memo(({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { tabsData } = useWizardVMContext();
  const history = useHistory();

  const templateName = tabsData?.overview?.templateMetadata?.name;
  const templateDisplayName = tabsData?.overview?.templateMetadata?.displayName || templateName;
  const templateNamespace = tabsData?.overview?.templateMetadata?.namespace;

  const onBreadcrumbClick = (url: string) =>
    confirm(t('Are you sure you want to leave this page?')) && history.push(url);

  return (
    <div className="pf-c-page__main-breadcrumb">
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() =>
              onBreadcrumbClick(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`)
            }
          >
            {t('Catalog')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() =>
              onBreadcrumbClick(
                `/k8s/ns/${
                  namespace || DEFAULT_NAMESPACE
                }/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}`,
              )
            }
          >
            {t('Customize')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('Review')}</BreadcrumbItem>
      </Breadcrumb>
      <Title headingLevel="h1">{t('Review and create VirtualMachine')}</Title>
      <Text component={TextVariants.small} data-test="wizard title help">
        {t('Template: {{templateDisplayName}}', { templateDisplayName })}
      </Text>
    </div>
  );
});
WizardHeader.displayName = 'WizardHeader';
