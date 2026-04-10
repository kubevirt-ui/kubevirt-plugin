import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getFolder, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewGridLeftColumn: FC = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;
  const { creationMethod, project: destinationNamespace } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const project = isCloneMethod ? destinationNamespace : getNamespace(vm);

  return (
    <ExpandableSection isIndented toggleText={t('Details')}>
      <DescriptionList isHorizontal>
        <DescriptionItem
          descriptionData={getCluster(vm) || NO_DATA_DASH}
          descriptionHeader={t('Cluster')}
        />
        <DescriptionItem
          descriptionData={project || NO_DATA_DASH}
          descriptionHeader={t('Project')}
        />
        <DescriptionItem
          descriptionData={getFolder(vm) || NO_DATA_DASH}
          descriptionHeader={t('Folder')}
        />
      </DescriptionList>
    </ExpandableSection>
  );
};

export default ReviewGridLeftColumn;
