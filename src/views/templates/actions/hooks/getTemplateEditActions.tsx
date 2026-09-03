// Extracted from useVirtualMachineTemplatesActions.tsx
// Root: src/views/templates/actions/hooks/useVirtualMachineTemplatesActions.tsx

import React from 'react';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { type ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import { EDIT_TEMPLATE_ID } from '../constants';
import { getEditBootSourceRefDescription } from '../editBootSource';

import { NO_EDIT_TEMPLATE_PERMISSIONS } from '../../utils/constants';
import EditBootSourceModal from '../components/EditBootSourceModal';
import {
  getCommonOrPermissionDescription,
  type GetTemplateActionsParams,
} from './getTemplateActionHelpers';

export const getTemplateEditActions = ({
  baseTemplatePage,
  bootDataSource,
  canWriteToDataSourceNs,
  createModal,
  editableBootSource,
  goToTemplatePage,
  hasEditPermission,
  isCommonTemplate,
  loadingBootSource,
  navigate,
  t,
  template,
}: GetTemplateActionsParams): Action[] => [
  {
    accessReview: asAccessReview(TemplateModel, template, 'patch'),
    cta: (): void => goToTemplatePage(template),
    id: EDIT_TEMPLATE_ID,
    label: t('Edit'),
  },
  {
    accessReview: asAccessReview(TemplateModel, template, 'create'),
    cta: (): void =>
      createModal(
        ({ isOpen, onClose }: ModalComponentProps): React.JSX.Element => (
          <CloneTemplateModal
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onTemplateCloned={goToTemplatePage}
          />
        ),
      ),
    id: 'clone-template',
    label: t('Clone'),
  },
  {
    accessReview: asAccessReview(TemplateModel, template, 'patch'),
    cta: (): void => {
      navigate(`${baseTemplatePage}/disks`);
    },
    description: getCommonOrPermissionDescription(
      isCommonTemplate,
      hasEditPermission,
      t('Red Hat template cannot be edited'),
      t(NO_EDIT_TEMPLATE_PERMISSIONS),
    ),
    disabled: isCommonTemplate || !hasEditPermission,
    id: 'edit-boot-source',
    label: t('Edit boot source'),
  },
  {
    accessReview: asAccessReview(TemplateModel, template, 'patch'),
    cta: (): void =>
      createModal(
        ({ isOpen, onClose }: ModalComponentProps): React.JSX.Element => (
          <EditBootSourceModal
            dataSource={bootDataSource}
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
          />
        ),
      ),
    description:
      !loadingBootSource || !canWriteToDataSourceNs
        ? getEditBootSourceRefDescription(bootDataSource, canWriteToDataSourceNs)
        : undefined,
    disabled: !editableBootSource || !canWriteToDataSourceNs,
    id: 'edit-boot-source-ref',
    label: (
      <>
        {t('Edit boot source reference')} {loadingBootSource && <Loading />}
      </>
    ),
  },
];
