import React, { FC } from 'react';

import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

const CreateProject: FC = () => {
  const { t } = useKubevirtTranslation();
  const [_, setActiveNamespace] = useActiveNamespace();
  const { createModal } = useModal();
  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <CreateProjectModal
            {...props}
            createdProject={(namespace) => {
              const nsName = getName(namespace);
              setActiveNamespace(nsName);
            }}
          />
        ))
      }
      className="vms-tree-view__action"
      icon={<PlusCircleIcon />}
      iconPosition="start"
      variant={ButtonVariant.link}
    >
      {t('Create Project')}
    </Button>
  );
};

export default CreateProject;
