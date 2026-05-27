import React, { FC } from 'react';

import ClusterDropdown from '@kubevirt-utils/components/ClusterNamespaceDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterNamespaceDropdown/NamespaceDropdown';
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
  const { cluster, folder, namespace, setCluster, setFolder, setNamespace } = useVMWizardStore();

  return (
    <Form className="vm-creation-location-form">
      {isACMPage && (
        <FormGroup isRequired label={t('Cluster')}>
          <ClusterDropdown
            onChange={(selectedCluster) => {
              setCluster(selectedCluster);
              setFolder('');
              if (selectedCluster !== cluster) setNamespace('');
            }}
            selectedCluster={cluster}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Namespace')}>
        <NamespaceDropdown
          onChange={(selectedNamespace) => {
            setNamespace(selectedNamespace);
            setFolder('');
          }}
          cluster={cluster}
          includeAllNamespaces={false}
          selectedNamespace={namespace || DEFAULT_NAMESPACE}
        />
      </FormGroup>
      <FormGroup label={t('Folder (optional)')}>
        <FolderSelect
          cluster={cluster}
          namespace={namespace}
          selectedFolder={folder}
          setSelectedFolder={(newFolder) => setFolder(newFolder)}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
