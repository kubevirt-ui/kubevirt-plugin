import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getFolder, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, ExpandableSection } from '@patternfly/react-core';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';

const ReviewGridLeftColumn: FC = () => {
  const { t } = useKubevirtTranslation();
  const vm = wizardVMSignal.value;

  return (
    <ExpandableSection isIndented toggleText={t('Details')}>
      <DescriptionList isHorizontal>
        <DescriptionItem
          descriptionData={getCluster(vm) || NO_DATA_DASH}
          descriptionHeader={t('Cluster')}
        />
        <DescriptionItem
          descriptionData={getNamespace(vm) || NO_DATA_DASH}
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
