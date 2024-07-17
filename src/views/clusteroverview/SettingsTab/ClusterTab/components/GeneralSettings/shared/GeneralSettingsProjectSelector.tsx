import React, { FC } from 'react';

import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, MenuFooter, Spinner } from '@patternfly/react-core';

type GeneralSettingsProjectSelectorProps = {
  loaded: boolean;
  onSelect: (value: string) => void;
  projects: K8sResourceCommon[];
  selectedProject: string;
  setSelectedProject: (value: string) => void;
};
const GeneralSettingsProjectSelector: FC<GeneralSettingsProjectSelectorProps> = ({
  loaded,
  onSelect,
  projects,
  selectedProject,
  setSelectedProject,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <InlineFilterSelect
      menuFooter={
        <MenuFooter>
          <Button
            onClick={() =>
              createModal((props) => (
                <CreateProjectModal
                  {...props}
                  createdProject={(value) =>
                    value?.metadata?.name && setSelectedProject(value?.metadata?.name)
                  }
                />
              ))
            }
            key="create-project"
            variant={ButtonVariant.secondary}
          >
            {t('Create project')}
          </Button>
        </MenuFooter>
      }
      options={[
        ...projects
          ?.map((proj) => ({
            groupVersionKind: modelToGroupVersionKind(ProjectModel),
            value: getName(proj),
          }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      ]}
      toggleProps={{
        icon: !loaded && <Spinner size="sm" />,
        isDisabled: !loaded,
        placeholder: t('Select project'),
      }}
      selected={selectedProject}
      setSelected={onSelect}
    />
  );
};

export default GeneralSettingsProjectSelector;
