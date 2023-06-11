import * as React from 'react';
import { Trans } from 'react-i18next';

import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type OwnerDetailsItemProps = {
  obj: K8sResourceCommon;
};

const OwnerDetailsItem: React.FC<OwnerDetailsItemProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              <div>
                List of objects depended by this object. If ALL objects in the list have been
                deleted, this object will be garbage collected. If this object is managed by a
                controller, then an entry in this list will point to this controller, with the
                controller field set to true. There cannot be more than one managing controller.
              </div>
              <Breadcrumb className="margin-top">
                <BreadcrumbItem>{obj?.kind}</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>ownerReferences</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Owner')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Owner')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <OwnerReferences obj={obj} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default OwnerDetailsItem;
