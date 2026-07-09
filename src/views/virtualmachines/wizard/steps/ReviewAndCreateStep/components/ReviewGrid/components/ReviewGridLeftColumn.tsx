import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFolder, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import CloneDescriptionInput from './CloneDescriptionInput';
import CloneNameInput from './CloneNameInput';

const ReviewGridLeftColumn: FC = () => {
  const { t } = useKubevirtTranslation();
  const vm = customizeWizardVMSignal.value;

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const { getValues } = useVMWizard();
  const { creationMethod, name, project } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);

  const isCloneMethod = isCloneCreationMethod(creationMethod);

  return (
    <ExpandableSection isExpanded isIndented toggleText={t('Details')}>
      <DescriptionList isHorizontal>
        {isCloneMethod ? (
          <>
            <CloneNameInput />
            <CloneDescriptionInput />
          </>
        ) : (
          <DescriptionItem descriptionData={name || NO_DATA_DASH} descriptionHeader={t('Name')} />
        )}
        <DescriptionItem
          descriptionData={getCluster(vm) || NO_DATA_DASH}
          descriptionHeader={t('Cluster')}
        />
        <DescriptionItem
          descriptionData={project || NO_DATA_DASH}
          descriptionHeader={t('Project')}
        />
        {!treeViewFoldersLoading && treeViewFoldersEnabled && (
          <DescriptionItem
            descriptionData={getFolder(vm) || NO_DATA_DASH}
            descriptionHeader={t('Folder')}
          />
        )}
      </DescriptionList>
    </ExpandableSection>
  );
};

export default ReviewGridLeftColumn;
