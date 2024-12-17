import React, { FC } from 'react';

import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { TEXT_FILTER_LABELS_ID } from '@virtualmachines/list/hooks/constants';

const CreateProject: FC = () => {
  const { t } = useKubevirtTranslation();
  const [_, setActiveNamespace] = useActiveNamespace();
  const { removeQueryArguments } = useQueryParamsMethods();
  const { createModal } = useModal();
  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <CreateProjectModal
            {...props}
            createdProject={(namespace) => {
              removeQueryArguments(TEXT_FILTER_LABELS_ID);
              setActiveNamespace(getName(namespace));
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
