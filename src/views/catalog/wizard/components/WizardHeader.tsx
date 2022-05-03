import * as React from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

export const WizardHeader: React.FC<{ namespace: string }> = React.memo(({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { tabsData } = useWizardVMContext();
  const history = useHistory();

  const templateName = tabsData?.overview?.templateMetadata?.name;
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
              onBreadcrumbClick(`/k8s/ns/${namespace || 'default'}/${VirtualMachineModelRef}`)
            }
          >
            {t('Virtualization')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => onBreadcrumbClick(`/k8s/ns/${namespace || 'default'}/templatescatalog`)}
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
                  namespace || 'default'
                }/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}`,
              )
            }
          >
            {t('Customize')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('Review')}</BreadcrumbItem>
      </Breadcrumb>
      <Stack>
        <StackItem className="co-m-pane__heading">
          <Title headingLevel="h1">{t('Review and create VirtualMachine')}</Title>
        </StackItem>
        <StackItem>
          <Trans t={t} ns="plugin__kubevirt-plugin">
            You can click the Create VirtualMachine button to create your VirtualMachine or
            customize it by editing each of the tabs below. When done, click the Create
            VirtualMachine button.
          </Trans>
        </StackItem>
      </Stack>
    </div>
  );
});
WizardHeader.displayName = 'WizardHeader';
