import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type AnnotationsProps = {
  annotations: {
    [key: string]: string;
  };
};

const Annotations: React.FC<AnnotationsProps> = ({ annotations }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Annotations')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Annotations is an unstructured key value map stored with a resource that may be set by
              external tools to store and retrieve arbitrary metadata. They are not queryable and
              should be preserved when modifying objects.
              <div>
                {`\nMore info:`}
                <a href="http://kubernetes.io/docs/user-guide/annotations">
                  {` http://kubernetes.io/docs/user-guide/annotations`}
                </a>
              </div>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>annotations</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Annotations')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <Button variant="link" isInline>
          {t('{{count}} Annotations', {
            count: Object.keys(annotations || {}).length,
          })}
        </Button>
      </DescriptionListDescription>
    </>
  );
};

export default Annotations;
