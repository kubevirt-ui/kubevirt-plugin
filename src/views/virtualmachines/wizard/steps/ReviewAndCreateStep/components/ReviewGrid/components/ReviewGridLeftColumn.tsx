import { type FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFolder, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';
import { useWizardReviewVM } from '@virtualmachines/wizard/hooks/useWizardReviewVM';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import CloneDescriptionInput from './CloneDescriptionInput';
import CloneNameInput from './CloneNameInput';

const ReviewGridLeftColumn: FC = () => {
  const { t } = useKubevirtTranslation();

  const vm = useWizardReviewVM();

  const { featureEnabled: treeViewFoldersEnabled, loading: treeViewFoldersLoading } =
    useFeatures(TREE_VIEW_FOLDERS);

  const { getValues } = useVMWizard();
  const { name, project } = getValues('deployment');
  const creationMethod = getValues('creationMethod');

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
          <DescriptionItem descriptionData={name ?? NO_DATA_DASH} descriptionHeader={t('Name')} />
        )}
        <DescriptionItem
          descriptionData={getCluster(vm) ?? NO_DATA_DASH}
          descriptionHeader={t('Cluster')}
        />
        <DescriptionItem
          descriptionData={project ?? NO_DATA_DASH}
          descriptionHeader={t('Project')}
        />
        {!treeViewFoldersLoading && treeViewFoldersEnabled && (
          <DescriptionItem
            descriptionData={getFolder(vm) ?? NO_DATA_DASH}
            descriptionHeader={t('Group')}
          />
        )}
      </DescriptionList>
    </ExpandableSection>
  );
};

export default ReviewGridLeftColumn;
