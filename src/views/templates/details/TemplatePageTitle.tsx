import React, { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { TemplateModel, VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  isDeprecatedTemplate,
  isOpenShiftTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Flex,
  Label,
  Title,
} from '@patternfly/react-core';

import VirtualMachineTemplatesActions from '../actions/VirtualMachineTemplatesActions';
import CommonTemplateAlert from './CommonTemplateAlert';
import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';
import NoPermissionTemplateAlert from './NoPermissionTemplateAlert';

type TemplatePageTitleTitleProps = {
  template: Template;
};

const TemplatePageTitle: FC<TemplatePageTitleTitleProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const lastNamespacePath = useLastNamespacePath();
  const isACMPage = useIsACMPage();
  const { hasEditPermission, isCommonTemplate } = useEditTemplateAccessReview(template);

  const templateName = getName(template);

  const isOSTemplate = isOpenShiftTemplate(template);

  const isSidebarEditorDisplayed = !location.pathname.includes(
    `/${templateName}/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Button
              isInline
              onClick={() =>
                navigate(
                  isACMPage ? getACMTemplateListURL() : `/k8s/${lastNamespacePath}/templates`,
                )
              }
              variant={ButtonVariant.link}
            >
              {t('Templates')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{templateName}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">
            {isOSTemplate ? TemplateModel.abbr : VirtualMachineTemplateModel.abbr}
          </span>
          <span data-test="resource-title">
            {templateName}{' '}
            {isDeprecatedTemplate(template) && <Label isCompact>{t('Deprecated')}</Label>}
          </span>
        </Title>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          {isSidebarEditorDisplayed && <SidebarEditorSwitch />}
          {isOSTemplate && <VirtualMachineTemplatesActions template={template} />}
        </Flex>
      </PaneHeading>
      {isCommonTemplate && isOSTemplate && <CommonTemplateAlert template={template} />}
      {!isCommonTemplate && !hasEditPermission && <NoPermissionTemplateAlert />}
    </DetailsPageTitle>
  );
};

export default TemplatePageTitle;
