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
  Label,
  LabelGroup,
  Popover,
} from '@patternfly/react-core';

type LabelsProps = {
  labels: {
    [key: string]: string;
  };
};

const Labels: React.FC<LabelsProps> = ({ labels }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Labels')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Map of string keys and values that can be used to organize and categorize (scope and
              select) objects. May match selectors of replication controllers and services. More
              info:{' '}
              <a href="http://kubernetes.io/docs/user-guide/labels">
                http://kubernetes.io/docs/user-guide/labels
              </a>
              <Breadcrumb>
                <BreadcrumbItem>Template</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>labels</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Labels')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <LabelGroup defaultIsOpen>
          {Object.entries(labels || {})?.map(([key, value]) => (
            <Label key={key}>{`${key}=${value}`}</Label>
          ))}
        </LabelGroup>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Labels;
