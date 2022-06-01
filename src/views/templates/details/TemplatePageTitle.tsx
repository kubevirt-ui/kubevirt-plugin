import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespace } from '@kubevirt-utils/hooks/useLastNamespace';
import { Breadcrumb, BreadcrumbItem, Button, Title } from '@patternfly/react-core';

import { isCommonVMTemplate } from '../utils';

import NoEditableTemplateAlert from './NoEditableTemplateAlert';
import TemplateActions from './TemplateActions';

type TemplatePageTitleTitleProps = {
  template: V1Template;
};

const TemplatePageTitle: React.FC<TemplatePageTitleTitleProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [lastNamespace] = useLastNamespace();
  const isEditDisabled = isCommonVMTemplate(template);

  const namespacePath = lastNamespace === ALL_NAMESPACES ? lastNamespace : `ns/${lastNamespace}`;

  const onBreadcrumbClick = (url: string) =>
    confirm(t('Are you sure you want to leave this page?')) && history.push(url);

  return (
    <div className="pf-c-page__main-breadcrumb">
      <Breadcrumb>
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => onBreadcrumbClick(`/k8s/${namespacePath}/templates`)}
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
      {isEditDisabled && <NoEditableTemplateAlert template={template} />}
    </div>
  );
};

export default TemplatePageTitle;
