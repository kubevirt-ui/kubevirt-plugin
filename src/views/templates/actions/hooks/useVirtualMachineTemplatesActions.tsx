import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';

type useVirtualMachineTemplatesActionsProps = (template: V1Template) => Action[];

const useVirtualMachineTemplatesActions: useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => {
  const { t } = useKubevirtTranslation();
  const isCommonTemplate = template.metadata.labels['template.kubevirt.io/type'] === 'base';
  const { createModal } = useModal();
  const history = useHistory();

  const actions = [
    {
      id: 'edit-template',
      label: t('Edit Template'),
      cta: () =>
        // lead to the template details page
        history.push(`/k8s/ns/${template.metadata.namespace}/templates/${template.metadata.name}`),
    },
    {
      id: 'clone-template',
      label: t('Clone Template'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneTemplateModal obj={template} isOpen={isOpen} onClose={onClose} />
        )),
    },
    {
      id: 'edit-boot-source',
      label: t('Edit boot source'),
      description: t('This action is currently not avaliable'),
      disabled: true, // TODO check if datasource is available and does not have a matching cron import job
      cta: () => console.log('Edit boot source'),
      // TODO add the modal
      // cta: () =>
      //   createModal(({ isOpen, onClose }) => (
      //     <EditBootSourceModal obj={template} isOpen={isOpen} onClose={onClose} />
      //   )),
    },
    {
      id: 'delete-template',
      label: t('Delete Template'),
      description: t('Common templates cannot be deleted'),
      disabled: isCommonTemplate, // common templates cannot be deleted
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('Delete Virtual Machine Template?')}
            onDeleteSubmit={() =>
              k8sDelete({
                model: TemplateModel,
                resource: template,
              })
            }
          />
        )),
    },
  ];

  return actions;
};

export default useVirtualMachineTemplatesActions;
