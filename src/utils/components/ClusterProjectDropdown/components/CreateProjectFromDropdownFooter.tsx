import { type FC, useCallback } from 'react';

import type { DropdownMenuFooterComponentProps } from '@kubevirt-utils/components/ClusterProjectDropdown/Dropdown/types';
import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Button } from '@patternfly/react-core';

const CreateProjectFromDropdownFooter: FC<DropdownMenuFooterComponentProps> = ({
  closeMenu,
  filterText,
  initialCluster,
  onProjectCreated,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const suggestedName = filterText.trim();

  const handleClick = useCallback((): void => {
    closeMenu();
    createModal((props) => (
      <CreateProjectModal
        {...props}
        createdProject={(newProject) => {
          if (!getName(newProject) && !suggestedName) {
            return;
          }
          onProjectCreated(newProject);
        }}
        initialCluster={initialCluster}
        initialName={suggestedName || undefined}
      />
    ));
  }, [closeMenu, createModal, initialCluster, onProjectCreated, suggestedName]);

  return (
    <Button data-test="create-project-from-dropdown" onClick={handleClick} variant="secondary">
      {suggestedName
        ? t('Create project "{{filterValue}}"', { filterValue: suggestedName })
        : t('Create project')}
    </Button>
  );
};

export default CreateProjectFromDropdownFooter;
