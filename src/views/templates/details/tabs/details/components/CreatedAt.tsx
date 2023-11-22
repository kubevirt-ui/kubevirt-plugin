import * as React from 'react';
import { Trans } from 'react-i18next';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
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

type CreatedAtProps = {
  template: V1Template;
};

const CreatedAt: React.FC<CreatedAtProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              CreationTimestamp is a timestamp representing the server time when this object was
              created. It is not guaranteed to be set in happens-before order across separate
              operations. Clients may not set this value. It is represented in RFC3339 form and is
              in UTC.
              <div className="margin-top">
                Populated by the system. Read-only. Null for lists. More info:{' '}
                <a href="https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata">
                  {` https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata`}
                </a>
              </div>
              <Breadcrumb className="margin-top">
                <BreadcrumbItem>Template</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>creationTimestamp</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Created at')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Created at')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <Timestamp timestamp={template?.metadata?.creationTimestamp} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default CreatedAt;
