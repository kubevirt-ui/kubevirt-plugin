import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

import EditBootSourceModal from '../components/EditBootSourceModal';
import { hasEditableBootSource } from '../editBootSource';

type useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => [actions: Action[], onLazsyActions: () => void];

export const EDIT_TEMPLATE_ID = 'edit-template';
const useVirtualMachineTemplatesActions: useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => {
  const { t } = useKubevirtTranslation();
  const isCommonTemplate = isCommonVMTemplate(template);
  const { createModal } = useModal();
  const history = useHistory();
  const [editableBootSource, setEditableBootSource] = React.useState<boolean>(null);

  const onLazsyActions = React.useCallback(async () => {
    if (editableBootSource === null) {
      const editable = await hasEditableBootSource(template);
      setEditableBootSource(editable);
    }
  }, [editableBootSource, template]);

  const actions = [
    {
      id: EDIT_TEMPLATE_ID,
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
      label: (
        <>
          {t('Edit boot source')} {editableBootSource === null && <Loading />}
        </>
      ),
      description: !editableBootSource && t('Boot source cannot be edited for Red Hat templates'),
      disabled: !editableBootSource,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <EditBootSourceModal obj={template} isOpen={isOpen} onClose={onClose} />
        )),
    },
    {
      id: 'delete-template',
      label: t('Delete Template'),
      description: isCommonTemplate && t('Red Hat template cannot be deleted'),
      disabled: isCommonTemplate,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('Delete VirtualMachine Template?')}
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

  return [actions, onLazsyActions];
};

export default useVirtualMachineTemplatesActions;
