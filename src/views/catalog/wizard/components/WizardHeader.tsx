import React, { FC, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

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

export const WizardHeader: FC<{ namespace: string }> = memo(({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { tabsData } = useWizardVMContext();
  const navigate = useNavigate();
  const location = useLocation();

  const templateName = tabsData?.overview?.templateMetadata?.name;
  const templateDisplayName = tabsData?.overview?.templateMetadata?.displayName || templateName;

  const onBreadcrumbClick = (url: string) =>
    confirm(t('Are you sure you want to leave this page?')) && navigate(url);

  const isSidebarEditorDisplayed = !location.pathname.includes(
    `/catalog/template/review/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <div className="pf-c-page__main-breadcrumb wizard-header">
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            onClick={() =>
              onBreadcrumbClick(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog/template`)
            }
            isInline
            variant="link"
          >
            {t('Catalog')}
          </Button>
        </BreadcrumbItem>
      </Breadcrumb>
      <Split hasGutter>
        <Title headingLevel="h1">{t('Customize and create VirtualMachine')}</Title>
        {isSidebarEditorDisplayed && <SidebarEditorSwitch />}
      </Split>
      <Text component={TextVariants.small} data-test="wizard title help">
        {t('Template: {{templateDisplayName}}', { templateDisplayName })}
      </Text>
    </div>
  );
});
WizardHeader.displayName = 'WizardHeader';
