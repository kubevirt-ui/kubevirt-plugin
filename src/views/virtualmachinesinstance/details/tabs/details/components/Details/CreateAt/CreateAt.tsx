import * as React from 'react';
import { Trans } from 'react-i18next';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type CreateAtProps = {
  timestamp: string;
};

const CreateAt: React.FC<CreateAtProps> = ({ timestamp }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Created At')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              CreationTimestamp is a timestamp representing the server time when this object was
              created. It is not guaranteed to be set in happens-before order across separate
              operations. Clients may not set this value. It is represented in RFC3339 form and is
              in UTC. Populated by the system. Read-only. Null for lists.
              <div>
                {`\nMore info:`}
                <a href="https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata">
                  {` https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata`}
                </a>
              </div>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>creationTimestamp</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Created At')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <Timestamp timestamp={timestamp} />
      </DescriptionListDescription>
    </>
  );
};

export default CreateAt;
