import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type NamespaceProps = {
  namespace: string;
};

const Namespace: React.FC<NamespaceProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Namespace defines the space within which each name must be unique. An empty namespace
              is equivalent to the &quot;default&quot; namespace, but &quot;default&quot; is the
              canonical representation. Not all objects are required to be scoped to a namespace -
              the value of this field for those objects will be empty.
              <div className="margin-top">
                Must be a DNS_LABEL. Cannot be updated. More info:{' '}
                <a href="http://kubernetes.io/docs/user-guide/namespaces">
                  http://kubernetes.io/docs/user-guide/namespaces
                </a>
              </div>
              <Breadcrumb className="margin-top">
                <BreadcrumbItem>Template</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>namespace</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Namespace')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Namespace')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <ResourceLink kind="Namespace" name={namespace} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Namespace;
