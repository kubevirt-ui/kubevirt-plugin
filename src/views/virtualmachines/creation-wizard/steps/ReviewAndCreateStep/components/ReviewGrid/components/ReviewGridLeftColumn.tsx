import React, { FCC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFolder, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

const ReviewGridLeftColumn: FCC = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;
  const { project } = useVMWizardStore();

  return (
    <ExpandableSection isExpanded isIndented toggleText={t('Details')}>
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
