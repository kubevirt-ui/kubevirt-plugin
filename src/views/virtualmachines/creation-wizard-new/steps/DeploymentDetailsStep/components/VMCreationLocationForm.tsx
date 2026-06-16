import React, { FC } from 'react';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Form, FormGroup } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/useVMWizardStore';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);
  const { cluster, folder, project, setCluster, setFolder, setProject } = useVMWizardStore();
  const isTreeViewFoldersDisabled = treeViewFoldersLoading || !treeViewFoldersEnabled;

  return (
    <Form className="vm-creation-location-form">
      {isACMPage && (
        <FormGroup isRequired label={t('Cluster')}>
          <ClusterDropdown
            onChange={(selectedCluster) => {
              setCluster(selectedCluster);
              setFolder('');
              if (selectedCluster !== cluster) setProject('');
            }}
            selectedCluster={cluster}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Project')}>
        <NamespaceDropdown
          onChange={(selectedProject) => {
            setProject(selectedProject);
            setFolder('');
          }}
          cluster={cluster}
          includeAllProjects={false}
          selectedProject={project || DEFAULT_NAMESPACE}
        />
      </FormGroup>
      <FormGroup
        labelHelp={
          !treeViewFoldersLoading && !treeViewFoldersEnabled ? (
            <HelpTextIcon
              bodyContent={t(
                'Enable the "Enable folders in VirtualMachines tree view" preview feature in Settings > Preview features to use folders.',
              )}
            />
          ) : undefined
        }
        label={t('Folder (optional)')}
      >
        <FolderSelect
          cluster={cluster}
          isDisabled={isTreeViewFoldersDisabled}
          namespace={project}
          selectedFolder={folder}
          setSelectedFolder={(newFolder) => setFolder(newFolder)}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
