import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import Timestamp from '../../../../../../list/components/Timestamp/Timestamp';
import { DESCRIPTION_ANNOTATION, VM_TEMPLATE_ANNOTATION } from '../../../../../../utils/constants';
import { getOperatingSystem, getOperatingSystemName } from '../../../utils/operatingSystemHelper';
import MutedTextDiv from '../../MutedTextDiv/MutedTextDiv';
import VirtualMachineAnnotations from '../../VirtualMachineAnnotations/VirtualMachineAnnotations';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import VirtualMachineLabels from '../../VirtualMachineLabels/VirtualMachineLabels';

type VirtualMachineDetailsLeftGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineDetailsLeftGrid: React.FC<VirtualMachineDetailsLeftGridProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const None = <MutedTextDiv text={t('None')} />;
  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={vm?.metadata?.name}
          descriptionHeader={t('Name')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
          bodyContent={t(
            'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
          )}
          moreInfoURL="http://kubernetes.io/docs/user-guide/identifiers#names"
        />
        <VirtualMachineDescriptionItem
          descriptionData={<ResourceLink kind="Namespace" name={vm?.metadata?.namespace} />}
          descriptionHeader={t('Namespace')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
          bodyContent={t(
            'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
          )}
          moreInfoURL="http://kubernetes.io/docs/user-guide/namespaces"
        />
        <VirtualMachineDescriptionItem
          descriptionData={<VirtualMachineLabels labels={vm?.metadata?.labels} />}
          descriptionHeader={t('Labels')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
          bodyContent={t(
            'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
          )}
          moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
        />
        <VirtualMachineDescriptionItem
          descriptionData={<VirtualMachineAnnotations annotations={vm?.metadata?.annotations} />}
          descriptionHeader={t('Annotations')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
          bodyContent={t(
            'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
          )}
          moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
        />
        <VirtualMachineDescriptionItem
          descriptionData={getAnnotation(vm, DESCRIPTION_ANNOTATION) || None}
          descriptionHeader={t('Description')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={getOperatingSystemName(vm) || getOperatingSystem(vm)}
          descriptionHeader={t('Operating System')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={getLabel(vm, VM_TEMPLATE_ANNOTATION) || None}
          descriptionHeader={t('Template')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Timestamp timestamp={vm?.metadata?.creationTimestamp} />}
          descriptionHeader={t('Created at')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
          bodyContent={t(
            'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
          )}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<OwnerReferences obj={vm} />}
          descriptionHeader={t('Owner')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L110
          bodyContent={t(
            'List of objects depended by this object. If ALL objects in the list have been deleted, this object will be garbage collected. If this object is managed by a controller, then an entry in this list will point to this controller, with the controller field set to true. There cannot be more than one managing controller.',
          )}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsLeftGrid;
