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
import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Form, FormGroup } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

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
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER,
      CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
    ],
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
                  setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, '');
                  if (selectedCluster !== cluster)
                    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT, '');
                  setCustomizeWizardVMSignal(null);
                }}
                bookmarkCluster={hubClusterName}
                includeAllClusters={false}
                selectedCluster={field.value}
              />
            )}
            control={control}
            name={CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER}
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
                setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, '');
                setCustomizeWizardVMSignal(null);
              }}
              bookmarkCluster={hubClusterName}
              cluster={cluster}
              includeAllProjects={false}
              selectedProject={project || DEFAULT_NAMESPACE}
            />
          )}
          control={control}
          name={CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT}
        />
      </FormGroup>
      <FormGroup
        labelHelp={
          !treeViewFoldersLoading && !treeViewFoldersEnabled ? (
            <HelpTextIcon
              bodyContent={t(
                'Enable the "Enable groups in VirtualMachines tree view" preview feature in Settings > Preview features to use groups.',
              )}
            />
          ) : undefined
        }
        label={t('Group (optional)')}
      >
        <FolderSelect
          setSelectedFolder={(newFolder) =>
            setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, newFolder)
          }
          cluster={cluster}
          isDisabled={treeViewFoldersLoading || !treeViewFoldersEnabled}
          namespace={project}
          selectedFolder={folder}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
