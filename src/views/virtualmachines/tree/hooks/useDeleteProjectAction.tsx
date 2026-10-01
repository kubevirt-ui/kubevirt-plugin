import { useMemo } from 'react';

import { ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import { type FleetK8sResourceCommon } from '@stolostron/multicluster-sdk';
import DeleteProjectModal from '@virtualmachines/tree/components/DeleteProjectModal/DeleteProjectModal';

const useDeleteProjectAction = (
  cluster: string | undefined,
  namespace: string,
): ActionDropdownItemType => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const resource = useMemo<FleetK8sResourceCommon>(
    () => ({
      apiVersion: getAPIVersionForModel(ProjectModel),
      cluster,
      kind: ProjectModel.kind,
      metadata: { name: namespace },
    }),
    [cluster, namespace],
  );

  return {
    accessReview: asAccessReview(ProjectModel, resource, 'delete'),
    cta: () =>
      createModal?.(({ isOpen, onClose }) => (
        <DeleteProjectModal
          cluster={cluster}
          isOpen={isOpen}
          namespace={namespace}
          onClose={onClose}
          resource={resource}
        />
      )),
    id: 'delete-project',
    label: t('Delete project'),
  };
};

export default useDeleteProjectAction;
