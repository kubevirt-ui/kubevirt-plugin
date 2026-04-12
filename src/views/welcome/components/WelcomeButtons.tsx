import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import useTour from '@kubevirt-utils/components/GuidedTour/hooks/useTour';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVMWizardURL } from '@multicluster/urls';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';

type WelcomeButtonsProps = {
  onClose: () => Promise<void> | void;
};

const WelcomeButtons: FC<WelcomeButtonsProps> = ({ onClose }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const { createModal } = useModal();

  const { startTour } = useTour();
  const [projects, projectsLoaded, projectsError] = useProjects(undefined, true);
  const hasNoProjects = projectsLoaded && !projectsError && (!projects || projects.length === 0);

  const onCreateVM = () => {
    const wizardNamespace =
      activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;
    navigate(getVMWizardURL('', wizardNamespace));
    onClose();
  };

  const onCreateProject = () => {
    onClose();
    createModal?.((props) => (
      <CreateProjectModal
        {...props}
        createdProject={(newProject) => {
          const name = getName(newProject);
          if (name) setActiveNamespace(name);
        }}
      />
    ));
  };

  return (
    <Split hasGutter>
      <SplitItem>
        <Button
          className="WelcomeModal__button"
          isDisabled={!projectsLoaded}
          isLoading={!projectsLoaded}
          onClick={hasNoProjects ? onCreateProject : onCreateVM}
          variant={ButtonVariant.primary}
        >
          {hasNoProjects ? t('Create first project') : t('Create virtual machine')}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button
          onClick={() => {
            startTour();
            onClose();
          }}
          className="WelcomeModal__button"
          variant={ButtonVariant.link}
        >
          {t('Start tour')}
        </Button>
      </SplitItem>
      <SplitItem isFilled />
    </Split>
  );
};

export default WelcomeButtons;
