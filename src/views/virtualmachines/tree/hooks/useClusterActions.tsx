import { useCallback, useMemo } from 'react';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ProjectRequestModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

const useClusterActions = (cluster?: string): ActionDropdownItemType[] => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [, setActiveNamespace] = useActiveNamespace();

  const onProjectCreated = useCallback(
    (namespace: K8sResourceCommon): void => {
      setActiveNamespace(getName(namespace));
    },
    [setActiveNamespace],
  );

  const openCreateProjectModal = useCallback(
    (): void =>
      createModal((props) => (
        <CreateProjectModal {...props} createdProject={onProjectCreated} initialCluster={cluster} />
      )),
    [cluster, createModal, onProjectCreated],
  );

  const actions = useMemo<ActionDropdownItemType[]>(
    () => [
      {
        accessReview: {
          group: ProjectRequestModel.apiGroup,
          resource: ProjectRequestModel.plural,
          verb: 'create',
        },
        cta: openCreateProjectModal,
        id: 'create-project',
        label: t('Create project'),
      },
    ],
    [openCreateProjectModal, t],
  );

  return actions;
};

export default useClusterActions;
