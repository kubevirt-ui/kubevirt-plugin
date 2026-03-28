import React, { FC } from 'react';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup } from '@patternfly/react-core';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const fleetAvailable = useIsFleetAvailable();
  const { cluster, folder, project, setCluster, setFolder, setProject } = useVMWizardStore();

  return (
    <Form className="vm-creation-location-form">
      {fleetAvailable && (
        <FormGroup isRequired label={t('Cluster')}>
          <ClusterDropdown
            onChange={(selectedCluster) => {
              setCluster(selectedCluster);
              setFolder('');
            }}
            selectedCluster={cluster}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Project')}>
        <NamespaceDropdown
          onChange={(selectedProject) => {
            setProject(selectedProject);
            setFolder(undefined);
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
