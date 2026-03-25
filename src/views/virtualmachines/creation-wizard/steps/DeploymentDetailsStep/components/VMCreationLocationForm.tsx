import React, { FC } from 'react';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Form, FormGroup } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { cluster, folder, project, setCluster, setFolder, setProject } = useVMWizardStore();

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
          selectedProject={project || DEFAULT_NAMESPACE}
        />
      </FormGroup>
      <FormGroup label={t('Folder (optional)')}>
        <FolderSelect
          cluster={cluster}
          namespace={project}
          selectedFolder={folder}
          setSelectedFolder={(newFolder) => setFolder(newFolder)}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
