import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
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
    <>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Labels')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Map of string keys and values that can be used to organize and categorize (scope and
              select) objects. May match selectors of replication controllers and services.
              <div>
                {`\nMore info:`}
                <a href="http://kubernetes.io/docs/user-guide/labels">
                  {` http://kubernetes.io/docs/user-guide/labels`}
                </a>
              </div>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
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
        <LabelGroup>
          {Object.entries(labels || {})?.map(([key, value]) => (
            <Label color="blue" variant="outline" key={key}>{`${key}=${value}`}</Label>
          ))}
        </LabelGroup>
      </DescriptionListDescription>
    </>
  );
};

export default Labels;
