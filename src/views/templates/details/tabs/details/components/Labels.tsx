import * as React from 'react';
import { Trans } from 'react-i18next';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { LabelsAnnotationsType, TemplateDetailsGridProps } from '../TemplateDetailsPage';

const Labels: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const labels = template?.metadata?.labels;

  const onLabelsSubmit = (templateLabels: LabelsAnnotationsType) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: templateLabels,
        },
      ],
      model: TemplateModel,
      resource: template,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <LabelsModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onLabelsSubmit={onLabelsSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Flex className="title-edit-item-space">
          <FlexItem>
            <Popover
              bodyContent={
                <Trans ns="plugin__kubevirt-plugin">
                  Map of string keys and values that can be used to organize and categorize (scope
                  and select) objects. May match selectors of replication controllers and services.
                  More info:{' '}
                  <a href="http://kubernetes.io/docs/user-guide/labels">
                    http://kubernetes.io/docs/user-guide/labels
                  </a>
                  <Breadcrumb className="margin-top">
                    <BreadcrumbItem>Template</BreadcrumbItem>
                    <BreadcrumbItem>metadata</BreadcrumbItem>
                    <BreadcrumbItem>labels</BreadcrumbItem>
                  </Breadcrumb>
                </Trans>
              }
              hasAutoWidth
              headerContent={t('Labels')}
              maxWidth="30rem"
            >
              <DescriptionListTermHelpTextButton>{t('Labels')}</DescriptionListTermHelpTextButton>
            </Popover>
          </FlexItem>
          <FlexItem>
            <Button
              isDisabled={!editable}
              isInline
              onClick={onEditClick}
              type="button"
              variant="link"
            >
              {t('Edit')}
              <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
            </Button>
          </FlexItem>
        </Flex>
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
