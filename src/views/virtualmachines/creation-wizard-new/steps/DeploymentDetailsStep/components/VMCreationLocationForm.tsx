import React, { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

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
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const { control, setValue } = useVMWizard();
  const [cluster, folder, project] = useWatch({
    control,
    name: ['vmData.cluster', 'vmData.folder', 'vmData.project'],
  });

  return (
    <Form className="vm-creation-location-form">
      {isACMPage && (
        <FormGroup isRequired label={t('Cluster')}>
          <Controller
            render={({ field: { ref: _, ...field } }) => (
              <ClusterDropdown
                {...field}
                onChange={(selectedCluster) => {
                  field.onChange(selectedCluster);
                  setValue('vmData.folder', '');
                  if (selectedCluster !== cluster) setValue('vmData.project', '');
                }}
                bookmarkCluster={hubClusterName}
                includeAllClusters={false}
                selectedCluster={field.value}
              />
            )}
            control={control}
            name="vmData.cluster"
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Project')}>
        <Controller
          render={({ field: { ref: _, ...field } }) => (
            <NamespaceDropdown
              {...field}
              onChange={(selectedProject) => {
                field.onChange(selectedProject);
                setValue('vmData.folder', '');
              }}
              bookmarkCluster={hubClusterName}
              cluster={cluster}
              includeAllProjects={false}
              selectedProject={project || DEFAULT_NAMESPACE}
            />
          )}
          control={control}
          name="vmData.project"
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
          isDisabled={treeViewFoldersLoading || !treeViewFoldersEnabled}
          namespace={project}
          selectedFolder={folder}
          setSelectedFolder={(newFolder) => setValue('vmData.folder', newFolder)}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
