// Extracted from useVirtualMachineTemplatesActions.tsx
// Root: src/views/templates/actions/hooks/useVirtualMachineTemplatesActions.tsx

import { type JSX } from 'react';

import { TemplateModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { type ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import {
  NO_DELETE_TEMPLATE_PERMISSIONS,
  NO_EDIT_TEMPLATE_PERMISSIONS,
} from '../../utils/constants';
import {
  getCommonOrPermissionDescription,
  type GetTemplateActionsParams,
  patchTemplateMetadata,
} from './getTemplateActionHelpers';

export const getTemplateMetadataActions = ({
  canDeleteTemplate,
  cluster,
  createModal,
  hasEditPermission,
  isCommonTemplate,
  onDelete,
  t,
  template,
}: GetTemplateActionsParams): Action[] => [
  {
    accessReview: asAccessReview(TemplateModel, template, 'patch'),
    cta: (): void =>
      createModal(
        ({ isOpen, onClose }: ModalComponentProps): JSX.Element => (
          <LabelsModal
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onLabelsSubmit={(labels): Promise<V1Template> =>
              patchTemplateMetadata(template, cluster, 'labels', labels)
            }
          />
        ),
      ),
    description: getCommonOrPermissionDescription(
      isCommonTemplate,
      hasEditPermission,
      t('Labels cannot be edited for Red Hat templates'),
      t(NO_EDIT_TEMPLATE_PERMISSIONS),
    ),
    disabled: isCommonTemplate || !hasEditPermission,
    id: 'edit-labels',
    label: t('Edit labels'),
  },
  {
    accessReview: asAccessReview(TemplateModel, template, 'patch'),
    cta: (): void =>
      createModal(
        ({ isOpen, onClose }: ModalComponentProps): JSX.Element => (
          <AnnotationsModal
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onSubmit={(updatedAnnotations): Promise<V1Template> =>
              patchTemplateMetadata(template, cluster, 'annotations', updatedAnnotations)
            }
          />
        ),
      ),
    description: getCommonOrPermissionDescription(
      isCommonTemplate,
      hasEditPermission,
      t('Annotations cannot be edited for Red Hat templates'),
      t(NO_EDIT_TEMPLATE_PERMISSIONS),
    ),
    disabled: isCommonTemplate || !hasEditPermission,
    id: 'edit-annotations',
    label: t('Edit annotations'),
  },
  {
    accessReview: asAccessReview(TemplateModel, template, 'delete'),
    cta: (): void =>
      createModal(
        ({ isOpen, onClose }: ModalComponentProps): JSX.Element => (
          <DeleteModal
            headerText={t('Delete VirtualMachine template?')}
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onDeleteSubmit={onDelete}
            shouldRedirect={false}
          />
        ),
      ),
    description: getCommonOrPermissionDescription(
      isCommonTemplate,
      canDeleteTemplate,
      t('Red Hat template cannot be deleted'),
      t(NO_DELETE_TEMPLATE_PERMISSIONS),
    ),
    disabled: isCommonTemplate || !canDeleteTemplate,
    id: 'delete-template',
    label: t('Delete'),
  },
];
