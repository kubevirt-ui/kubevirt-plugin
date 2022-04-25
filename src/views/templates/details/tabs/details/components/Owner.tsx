import * as React from 'react';
import { Trans } from 'react-i18next';

import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type OwnerProps = {
  template: V1Template;
};

const Owner: React.FC<OwnerProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Owner')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              List of objects depended by this object. If ALL objects in the list have been deleted,
              this object will be garbage collected. If this object is managed by a controller, then
              an entry in this list will point to this controller, with the controller field set to
              true. There cannot be more than one managing controller.
              <Breadcrumb>
                <BreadcrumbItem>Template</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>ownerReferences</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Owner')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <OwnerReferences obj={template} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Owner;
