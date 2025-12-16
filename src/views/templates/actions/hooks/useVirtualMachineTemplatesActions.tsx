import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  getTemplateListURL,
  getTemplateURL,
} from '@kubevirt-utils/resources/template/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useEditTemplateAccessReview from '../../details/hooks/useIsTemplateEditable';
import {
  NO_DELETE_TEMPLATE_PERMISSIONS,
  NO_EDIT_TEMPLATE_PERMISSIONS,
} from '../../utils/constants';
import EditBootSourceModal from '../components/EditBootSourceModal';
import {
  createDataVolume,
  getBootDataSource,
  getEditBootSourceRefDescription,
  hasEditableBootSource,
} from '../editBootSource';

type useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => [actions: Action[], onLazyActions: () => void];

export const EDIT_TEMPLATE_ID = 'edit-template';
const useVirtualMachineTemplatesActions: useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => {
  const { t } = useKubevirtTranslation();
  const { hasEditPermission, isCommonTemplate } = useEditTemplateAccessReview(template);
  const { createModal } = useModal();
  const navigate = useNavigate();
  const [bootDataSource, setBootDataSource] = useState<V1beta1DataSource>();
  const [loadingBootSource, setLoadingBootSource] = useState(true);
  const editableBootSource = hasEditableBootSource(bootDataSource);
  const lastNamespacePath = useLastNamespacePath();
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(template) || hubClusterName;
  const isACMPage = useIsACMPage();
  const baseTemplatePage = getTemplateURL(
    getName(template),
    getNamespace(template),
    isACMPage ? cluster : undefined,
  );

  const [canDeleteTemplate] = useFleetAccessReview({
    cluster,
    namespace: getNamespace(template),
    resource: TemplateModel.plural,
    verb: 'delete',
  });

  const [canWriteToDataSourceNs] = useFleetAccessReview(
    asAccessReview(
      DataVolumeModel,
      createDataVolume(
        bootDataSource?.spec?.source?.pvc?.name,
        bootDataSource?.spec?.source?.pvc?.namespace,
        {},
        cluster,
      ),
      'create',
    ),
  );

  const goToTemplatePage = useCallback(
    (currentTemplate: V1Template) => {
      navigate(
        getTemplateURL(
          getName(currentTemplate),
          getNamespace(currentTemplate),
          isACMPage ? cluster : undefined,
        ),
      );
    },
    [navigate, isACMPage, cluster],
  );

  const onLazyActions = useCallback(async () => {
    if (!bootDataSource) {
      const dataSource = await getBootDataSource(template);
      setBootDataSource(dataSource);
    }
    setLoadingBootSource(false);
  }, [bootDataSource, template]);

  const onDelete = async () => {
    await kubevirtK8sDelete({
      cluster,
      model: TemplateModel,
      resource: template,
    }).then(() =>
      navigate(isACMPage ? getACMTemplateListURL() : getTemplateListURL(lastNamespacePath)),
    );
  };

  const actions = [
    {
      accessReview: asAccessReview(TemplateModel, template, 'patch'),
      cta: () => goToTemplatePage(template),
      id: EDIT_TEMPLATE_ID,
      label: t('Edit'),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'create'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneTemplateModal
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onTemplateCloned={goToTemplatePage}
          />
        )),
      id: 'clone-template',
      label: t('Clone'),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'patch'),
      cta: () => navigate(`${baseTemplatePage}/disks`),
      description:
        (isCommonTemplate && t('Red Hat template cannot be edited')) ||
        (!hasEditPermission && t(NO_EDIT_TEMPLATE_PERMISSIONS)),
      disabled: isCommonTemplate || !hasEditPermission,
      id: 'edit-boot-source',
      label: t('Edit boot source'),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <EditBootSourceModal
            dataSource={bootDataSource}
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
          />
        )),
      description:
        (!loadingBootSource || !canWriteToDataSourceNs) &&
        getEditBootSourceRefDescription(bootDataSource, canWriteToDataSourceNs),
      disabled: !editableBootSource || !canWriteToDataSourceNs,
      id: 'edit-boot-source-ref',
      label: (
        <>
          {t('Edit boot source reference')} {loadingBootSource && <Loading />}
        </>
      ),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            onLabelsSubmit={(labels) =>
              kubevirtK8sPatch({
                cluster,
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/labels',
                    value: labels,
                  },
                ],
                model: TemplateModel,
                resource: template,
              })
            }
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
          />
        )),
      description:
        (isCommonTemplate && t('Labels cannot be edited for Red Hat templates')) ||
        (!hasEditPermission && t(NO_EDIT_TEMPLATE_PERMISSIONS)),
      disabled: isCommonTemplate || !hasEditPermission,
      id: 'edit-labels',
      label: t('Edit labels'),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'patch'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <AnnotationsModal
            onSubmit={(updatedAnnotations) =>
              kubevirtK8sPatch({
                cluster,
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/annotations',
                    value: updatedAnnotations,
                  },
                ],
                model: TemplateModel,
                resource: template,
              })
            }
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
          />
        )),
      description:
        (isCommonTemplate && t('Annotations cannot be edited for Red Hat templates')) ||
        (!hasEditPermission && t(NO_EDIT_TEMPLATE_PERMISSIONS)),
      disabled: isCommonTemplate || !hasEditPermission,
      id: 'edit-annotations',
      label: t('Edit annotations'),
    },
    {
      accessReview: asAccessReview(TemplateModel, template, 'delete'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            headerText={t('Delete VirtualMachine Template?')}
            isOpen={isOpen}
            obj={template}
            onClose={onClose}
            onDeleteSubmit={onDelete}
          />
        )),
      description:
        (isCommonTemplate && t('Red Hat template cannot be deleted')) ||
        (!canDeleteTemplate && t(NO_DELETE_TEMPLATE_PERMISSIONS)),
      disabled: isCommonTemplate || !canDeleteTemplate,
      id: 'delete-template',
      label: t('Delete'),
    },
  ];

  return [actions, onLazyActions];
};

export default useVirtualMachineTemplatesActions;
