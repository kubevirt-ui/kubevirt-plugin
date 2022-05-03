import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type AnnotationsProps = {
  count: number;
};

const Annotations: React.FC<AnnotationsProps> = ({ count }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Annotations')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Annotations is an unstructured key value map stored with a resource that may be set by
              external tools to store and retrieve arbitrary metadata. They are not queryable and
              should be preserved when modifying objects. More info:{' '}
              <a href="http://kubernetes.io/docs/user-guide/annotations">
                http://kubernetes.io/docs/user-guide/annotations
              </a>
              <Breadcrumb className="margin-top">
                <BreadcrumbItem>Template</BreadcrumbItem>
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
        {t('{{count}} annotations', {
          count,
        })}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Annotations;
