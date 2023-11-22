import * as React from 'react';
import { Trans } from 'react-i18next';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
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
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { LabelsAnnotationsType, TemplateDetailsGridProps } from '../TemplateDetailsPage';

const Annotations: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const annotationsCount = Object.keys(template?.metadata?.annotations || {}).length;
  const annotationsText = t('{{annotationsCount}} Annotations', {
    annotationsCount,
  });

  const onAnnotationsSubmit = (updatedAnnotations: LabelsAnnotationsType) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/annotations',
          value: updatedAnnotations,
        },
      ],
      model: TemplateModel,
      resource: template,
    });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <AnnotationsModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={onAnnotationsSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
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
          hasAutoWidth
          headerContent={t('Annotations')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Annotations')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <Button isDisabled={!editable} isInline onClick={onEditClick} type="button" variant="link">
          {annotationsText}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Annotations;
