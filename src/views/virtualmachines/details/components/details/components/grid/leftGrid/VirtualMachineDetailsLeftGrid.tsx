import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getLabel } from '@kubevirt-utils/selectors';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DetailItem } from '@openshift-console/dynamic-plugin-sdk-internal';
import { GridItem } from '@patternfly/react-core';

import Timestamp from '../../../../../../list/components/Timestamp/Timestamp';
import { DESCRIPTION_ANNOTATION, VM_TEMPLATE_ANNOTATION } from '../../../../../../utils/constants';
import { getOperatingSystem, getOperatingSystemName } from '../../../utils/operatingSystemHelper';
import MutedTextDiv from '../../MutedTextDiv/MutedTextDiv';
import VirtualMachineLAnnotations from '../../VirtualMachineAnnotations/VirtualMachineAnnotations';
import VirtualMachineLabels from '../../VirtualMachineLabels/VirtualMachineLabels';

type VirtualMachineDetailsLeftGridProps = {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsLeftGrid: React.FC<VirtualMachineDetailsLeftGridProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <GridItem span={5}>
      <DetailItem key="name" title={t('Name')}>
        {obj?.metadata?.name}
      </DetailItem>
      <DetailItem key="namespace" title={t('Namespace')}>
        <ResourceLink kind="Namespace" name={obj?.metadata?.namespace} />
      </DetailItem>
      <DetailItem key="labels" title={t('Labels')}>
        <VirtualMachineLabels labels={obj?.metadata?.labels} />
      </DetailItem>
      <DetailItem key="annotations" title={t('Annotations')}>
        <VirtualMachineLAnnotations annotations={obj?.metadata?.annotations} />
      </DetailItem>
      <DetailItem key="description" title={t('Description')}>
        {getAnnotation(obj, DESCRIPTION_ANNOTATION) || <MutedTextDiv text={t('None')} />}
      </DetailItem>
      <DetailItem key="operatingSystem" title={t('Operating System')}>
        {getOperatingSystemName(obj) || getOperatingSystem(obj)}
      </DetailItem>
      <DetailItem key="template" title={t('Template')}>
        {getLabel(obj, VM_TEMPLATE_ANNOTATION) || t('None')}
      </DetailItem>
      <DetailItem key="timestamp" title={t('Created at')}>
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </DetailItem>
      <DetailItem key="ownerReference" title={t('Owner')}>
        <OwnerReferences obj={obj} />
      </DetailItem>
    </GridItem>
  );
};

export default VirtualMachineDetailsLeftGrid;
