import * as React from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getMachineType,
  useVMIAndPodsForVM,
  VM_TEMPLATE_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import {
  k8sPatch,
  k8sUpdate,
  K8sVerb,
  ResourceLink,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import CPUMemory from '../../CPUMemory/CPUMemory';
import VirtualMachineAnnotations from '../../VirtualMachineAnnotations/VirtualMachineAnnotations';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import VirtualMachineLabels from '../../VirtualMachineLabels/VirtualMachineLabels';

type VirtualMachineDetailsLeftGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineDetailsLeftGrid: React.FC<VirtualMachineDetailsLeftGridProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const [guestAgentData] = useGuestOS(vmi);
  const firmwareBootloaderTitle = getBootloaderTitleFromVM(vm, t);
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);

  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  const updateDescription = (updatedDescription) => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['metadata.annotations']);
      if (!vmDraft.metadata.annotations) vmDraft.metadata.annotations = {};

      if (updatedDescription) {
        vmDraft.metadata.annotations[DESCRIPTION_ANNOTATION] = updatedDescription;
      } else {
        delete vmDraft.metadata.annotations[DESCRIPTION_ANNOTATION];
      }
      return vmDraft;
    });
    return k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM?.metadata?.namespace,
      name: updatedVM?.metadata?.name,
    });
  };

  const None = <MutedTextSpan text={t('None')} />;
  const GuestAgentIsRequired = <MutedTextSpan text={t('Guest agend is required')} />;
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
          breadcrumb="VirtualMachine.metadata.name"
          data-test-id={`${vm?.metadata?.name}-name`}
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
          breadcrumb="VirtualMachine.metadata.namespace"
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
          breadcrumb="VirtualMachine.metadata.labels"
          isEdit
          showEditOnTitle
          editOnTitleJustify
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <LabelsModal
                obj={vm}
                isOpen={isOpen}
                onClose={onClose}
                onLabelsSubmit={(labels) =>
                  k8sPatch({
                    model: VirtualMachineModel,
                    resource: vm,
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/labels',
                        value: labels,
                      },
                    ],
                  })
                }
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-labels`}
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
          breadcrumb="VirtualMachine.metadata.annotations"
          isEdit
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <AnnotationsModal
                obj={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={(updatedAnnotations) =>
                  k8sPatch({
                    model: VirtualMachineModel,
                    resource: vm,
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/annotations',
                        value: updatedAnnotations,
                      },
                    ],
                  })
                }
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={getAnnotation(vm, DESCRIPTION_ANNOTATION) || None}
          descriptionHeader={t('Description')}
          isEdit
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DescriptionModal
                obj={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updateDescription}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-description`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            guestAgentData?.os?.prettyName || guestAgentData?.os?.name || GuestAgentIsRequired
          }
          isPopover
          // body-content text copied from:
          descriptionHeader={t('Operating System')}
          data-test-id={`${vm?.metadata?.name}-os`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<CPUMemory vm={vm} />}
          descriptionHeader={t('CPU | Memory')}
          isEdit={canUpdateVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <CPUMemoryModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-cpu-memory`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={getMachineType(vm) || NO_DATA_DASH}
          descriptionHeader={t('Machine type')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            !canUpdateVM ? (
              <MutedTextSpan text={firmwareBootloaderTitle} />
            ) : (
              firmwareBootloaderTitle
            )
          }
          descriptionHeader={t('Boot mode')}
          isEdit={canUpdateVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <FirmwareBootloaderModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-method`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            templateName ? (
              <ResourceLink
                groupVersionKind={modelToGroupVersionKind(TemplateModel)}
                name={templateName}
                namespace={templateNamespace}
                onClick={() =>
                  history.push(`/k8s/ns/${templateNamespace}/templates/${templateName}`)
                }
              />
            ) : (
              None
            )
          }
          descriptionHeader={t('Template')}
          data-test-id={`${vm?.metadata?.name}-template`}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Timestamp timestamp={vm?.metadata?.creationTimestamp} />}
          descriptionHeader={t('Created at')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
          bodyContent={t(
            'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
          )}
          breadcrumb="VirtualMachine.metadata.creationTimestamp"
        />
        <VirtualMachineDescriptionItem
          descriptionData={<OwnerReferences obj={vm} />}
          descriptionHeader={t('Owner')}
          isPopover
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L110
          bodyContent={t(
            'List of objects depended by this object. If ALL objects in the list have been deleted, this object will be garbage collected. If this object is managed by a controller, then an entry in this list will point to this controller, with the controller field set to true. There cannot be more than one managing controller.',
          )}
          breadcrumb="VirtualMachine.metadata.ownerReferences"
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsLeftGrid;
