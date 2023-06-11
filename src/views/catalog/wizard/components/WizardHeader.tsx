import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Split,
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

  const isSidebarEditorDisplayed = !history.location.pathname.includes(
    `/templatescatalog/review/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <div className="pf-c-page__main-breadcrumb wizard-header">
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            onClick={() =>
              onBreadcrumbClick(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`)
            }
            isInline
            variant="link"
          >
            {t('Catalog')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Button
            onClick={() =>
              onBreadcrumbClick(
                `/k8s/ns/${
                  namespace || DEFAULT_NAMESPACE
                }/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}`,
              )
            }
            isInline
            variant="link"
          >
            {t('Customize')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('Review')}</BreadcrumbItem>
      </Breadcrumb>
      <Split hasGutter>
        <Title headingLevel="h1">{t('Review and create VirtualMachine')}</Title>
        {isSidebarEditorDisplayed && <SidebarEditorSwitch />}
      </Split>
      <Text component={TextVariants.small} data-test="wizard title help">
        {t('Template: {{templateDisplayName}}', { templateDisplayName })}
      </Text>
    </div>
  );
});
WizardHeader.displayName = 'WizardHeader';
