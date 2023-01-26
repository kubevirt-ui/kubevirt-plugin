import React, { useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getPVC } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { DescriptionList } from '@patternfly/react-core';
import VirtualMachineDescriptionItem from '@virtualmachines/details/tabs/details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import { humanizeBinaryBytes } from '../../../../../../../../utils/utils/humanize';

type DetailsRightGridProps = {
  bootSource: V1beta1DataSource;
  namespace: string;
};

const DetailsRightGrid: React.FC<DetailsRightGridProps> = ({ bootSource, namespace }) => {
  const [pvcSource, setPVCSource] = useState<V1alpha1PersistentVolumeClaim>();

  const getPVCSource = async () => {
    if (!bootSource) return;

    const pvcData = bootSource?.spec?.source?.pvc;
    const pvc = await getPVC(pvcData?.name, pvcData?.namespace);
    setPVCSource(pvc);
  };
  getPVCSource().catch(console.log);

  const pvcDiskSize = pvcSource?.spec?.resources?.requests?.storage;
  const sizeData = humanizeBinaryBytes(pvcDiskSize);
  const storageClassName = pvcSource?.spec?.storageClassName;

  return (
    <DescriptionList isHorizontal isFluid>
      <VirtualMachineDescriptionItem descriptionData={namespace} descriptionHeader={t('Project')} />
      <VirtualMachineDescriptionItem
        descriptionData={pvcDiskSize && sizeData?.string}
        descriptionHeader={t('Boot disk size')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={storageClassName}
        descriptionHeader={t('Storage class')}
      />
    </DescriptionList>
  );
};

export default DetailsRightGrid;
