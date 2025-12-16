import React, { useMemo } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NamespaceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

const useClusterActions = (cluster?: string) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [_, setActiveNamespace] = useActiveNamespace();

  const actions = useMemo<ActionDropdownItemType[]>(
    () => [
      {
        accessReview: {
          group: NamespaceModel.apiGroup,
          resource: NamespaceModel.plural,
          verb: 'create',
        },
        cta: () =>
          createModal((props) => (
            <CreateProjectModal
              {...props}
              createdProject={(namespace) => {
                setActiveNamespace(getName(namespace));
              }}
              initialCluster={cluster}
            />
          )),
        id: 'create-project',
        label: t('Create project'),
      },
    ],
    [cluster, createModal, setActiveNamespace, t],
  );

  return actions;
};

export default useClusterActions;
