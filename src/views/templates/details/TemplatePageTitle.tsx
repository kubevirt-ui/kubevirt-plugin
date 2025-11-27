import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getACMTemplateListURL,
  getTemplateListURL,
  isDeprecatedTemplate,
} from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
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
  const [lastNamespace] = useLastNamespace();
  const isACMPage = useIsACMPage();
  const { hasEditPermission, isCommonTemplate } = useEditTemplateAccessReview(template);

  const isSidebarEditorDisplayed = !location.pathname.includes(
    `/templates/${template?.metadata?.name}/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Button
              onClick={() =>
                navigate(
                  isACMPage
                    ? getACMTemplateListURL()
                    : getTemplateListURL(
                        lastNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : lastNamespace,
                      ),
                )
              }
              isInline
              variant={ButtonVariant.link}
            >
              {t('Templates')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{template?.metadata?.name}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">T</span>
          <span>
            {template?.metadata?.name}{' '}
            {isDeprecatedTemplate(template) && <Label isCompact>{t('Deprecated')}</Label>}
          </span>
        </Title>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          {isSidebarEditorDisplayed && <SidebarEditorSwitch />}
          <VirtualMachineTemplatesActions template={template} />
        </Flex>
      </PaneHeading>
      {isCommonTemplate && <CommonTemplateAlert template={template} />}
      {!isCommonTemplate && !hasEditPermission && <NoPermissionTemplateAlert />}
    </DetailsPageTitle>
  );
};

export default TemplatePageTitle;
