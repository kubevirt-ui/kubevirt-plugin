import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { isDeprecatedTemplate } from '@kubevirt-utils/resources/template';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Label,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

import VirtualMachineTemplatesActions from '../actions/VirtualMachineTemplatesActions';

import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';
import CommonTemplateAlert from './CommonTemplateAlert';
import NoPermissionTemplateAlert from './NoPermissionTemplateAlert';

type TemplatePageTitleTitleProps = {
  template: V1Template;
};

const TemplatePageTitle: FC<TemplatePageTitleTitleProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const lastNamespacePath = useLastNamespacePath();
  const { hasEditPermission, isCommonTemplate } = useEditTemplateAccessReview(template);

  const isSidebarEditorDisplayed = !location.pathname.includes(
    `/templates/${template?.metadata?.name}/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <div className="pf-v6-c-page__main-breadcrumb TemplatePageTitle">
      <Breadcrumb>
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(`/k8s/${lastNamespacePath}/templates`)}
            variant={ButtonVariant.link}
          >
            {t('Templates')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{template?.metadata?.name}</BreadcrumbItem>
      </Breadcrumb>

      <Title className="co-m-pane__heading" headingLevel="h1">
        <span className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">T</span>
          <span className="co-resource-item__resource-name">
            {template?.metadata?.name}{' '}
            {isDeprecatedTemplate(template) && <Label isCompact>{t('Deprecated')}</Label>}
          </span>
        </span>
        <Split hasGutter>
          {isSidebarEditorDisplayed && (
            <SplitItem>
              <SidebarEditorSwitch />
            </SplitItem>
          )}
          <SplitItem>
            <VirtualMachineTemplatesActions template={template} />
          </SplitItem>
        </Split>
      </Title>
      {isCommonTemplate && <CommonTemplateAlert template={template} />}
      {!isCommonTemplate && !hasEditPermission && <NoPermissionTemplateAlert />}
    </div>
  );
};

export default TemplatePageTitle;
