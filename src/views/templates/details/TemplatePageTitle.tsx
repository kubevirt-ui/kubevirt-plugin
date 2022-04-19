import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { V1Template, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button, Title } from '@patternfly/react-core';

import TemplateActions from './TemplateActions';

type TemplatePageTitleTitleProps = {
  template: V1Template;
};

const TemplatePageTitle: React.FC<TemplatePageTitleTitleProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const namespace = template?.metadata?.namespace;

  const onBreadcrumbClick = (url: string) =>
    confirm(t('Are you sure you want to leave this page?')) && history.push(url);

  return (
    <div className="pf-c-page__main-breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => onBreadcrumbClick(`/k8s/ns/${namespace}/${VirtualMachineModelRef}`)}
          >
            {t('Virtualization')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => onBreadcrumbClick(`/k8s/ns/${namespace}/templates`)}
          >
            {t('Templates')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{template?.metadata?.name}</BreadcrumbItem>
      </Breadcrumb>

      <Title className="co-m-pane__heading" headingLevel="h1">
        <span className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">T</span>
          <span className="co-resource-item__resource-name">{template?.metadata?.name}</span>
        </span>
        <TemplateActions template={template} />
      </Title>
    </div>
  );
};

export default TemplatePageTitle;
