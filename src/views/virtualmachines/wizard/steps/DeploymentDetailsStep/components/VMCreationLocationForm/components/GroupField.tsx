import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

const GroupField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizardForm();

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const [cluster, folder, project] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.folder', 'deployment.project'],
  });

  return (
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
  );
};

export default GroupField;
