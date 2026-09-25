import { type FC } from 'react';
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
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import './VMCreationLocationForm.scss';

const VMCreationLocationForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const { control, getValues, setValue } = useVMWizardForm();
  const { clearDraft } = useWizardVMDraft();

  const [cluster, folder, project] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.folder', 'deployment.project'],
  });

  const clearLocationDependentVM = (): void => {
    if (getValues('creationMethod') === VMCreationMethod.CLONE) {
      setValue('clone.sourceVM', null, { shouldValidate: true });
    }
    clearDraft();
  };

  return (
    <Form className="vm-creation-location-form">
      {isACMPage && (
        <FormGroup isRequired label={t('Cluster')}>
          <Controller
            control={control}
            name="deployment.cluster"
            render={({ field: { ref: _ref, value, ...field } }) => (
              <ClusterDropdown
                {...field}
                bookmarkCluster={hubClusterName}
                includeAllClusters={false}
                onChange={(selectedCluster) => {
                  field.onChange(selectedCluster);
                  setValue('deployment.folder', '');
                  if (selectedCluster !== cluster)
                    setValue('deployment.project', '', { shouldValidate: true });
                  clearLocationDependentVM();
                }}
                selectedCluster={value as string}
              />
            )}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Project')}>
        <Controller
          control={control}
          name="deployment.project"
          render={({ field: { ref: _ref, ...field } }) => (
            <NamespaceDropdown
              {...field}
              bookmarkCluster={hubClusterName}
              cluster={cluster}
              includeAllProjects={false}
              onChange={(selectedProject) => {
                field.onChange(selectedProject);
                setValue('deployment.folder', '');
                clearLocationDependentVM();
              }}
              selectedProject={project || DEFAULT_NAMESPACE}
            />
          )}
        />
      </FormGroup>
      <FormGroup
        label={t('Group (optional)')}
        labelHelp={
          !treeViewFoldersLoading && !treeViewFoldersEnabled ? (
            <HelpTextIcon
              bodyContent={t(
                'Enable the "Enable groups in VirtualMachines tree view" preview feature in Settings > Preview features to use groups.',
              )}
            />
          ) : undefined
        }
      >
        <FolderSelect
          cluster={cluster}
          isDisabled={treeViewFoldersLoading || !treeViewFoldersEnabled}
          namespace={project}
          selectedFolder={folder}
          setSelectedFolder={(newFolder) => setValue('deployment.folder', newFolder)}
        />
      </FormGroup>
    </Form>
  );
};

export default VMCreationLocationForm;
