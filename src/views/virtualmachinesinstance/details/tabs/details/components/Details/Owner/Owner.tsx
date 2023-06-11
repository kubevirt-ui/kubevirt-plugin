import * as React from 'react';
import { Trans } from 'react-i18next';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { K8sIoApimachineryPkgApisMetaV1OwnerReference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OwnerReference, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type OwnerProps = {
  namespace: string;
  ownerReferences: K8sIoApimachineryPkgApisMetaV1OwnerReference[];
};

const Owner: React.FC<OwnerProps> = ({ namespace, ownerReferences }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              List of objects depended by this object. If ALL objects in the list have been deleted,
              this object will be garbage collected. If this object is managed by a controller, then
              an entry in this list will point to this controller, with the controller field set to
              true. There cannot be more than one managing controller.
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
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
        {(ownerReferences || [])?.map((ownerRef: OwnerReference) => (
          <ResourceLink
            groupVersionKind={VirtualMachineModelGroupVersionKind}
            key={ownerRef?.uid}
            name={ownerRef?.name}
            namespace={namespace}
          />
        ))}
      </DescriptionListDescription>
    </>
  );
};

export default Owner;
