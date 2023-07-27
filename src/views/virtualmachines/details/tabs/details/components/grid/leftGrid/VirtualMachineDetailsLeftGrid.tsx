import React, { FC, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
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
import { getOsNameFromGuestAgent, useGuestOS } from '@kubevirt-utils/resources/vmi';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sPatch,
  k8sUpdate,
  K8sVerb,
  ResourceLink,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem, Switch } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import VirtualMachineAnnotations from '../../VirtualMachineAnnotations/VirtualMachineAnnotations';
import VirtualMachineLabels from '../../VirtualMachineLabels/VirtualMachineLabels';

type VirtualMachineDetailsLeftGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineDetailsLeftGrid: FC<VirtualMachineDetailsLeftGridProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const [guestAgentData, loadedGuestAgent] = useGuestOS(vmi);
  const firmwareBootloaderTitle = getBootloaderTitleFromVM(vm);
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const [isChecked, setIsChecked] = useState<boolean>(!!vm?.spec?.template?.spec?.startStrategy);

  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );
  const updateStartStrategy = (checked: boolean) => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      vmDraft.spec.template.spec.startStrategy = checked ? printableVMStatus.Paused : null;
    });
    onSubmit(updatedVM);
  };

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
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });
  };

  const None = <MutedTextSpan text={t('None')} />;

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
          bodyContent={t(
            'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. ',
          )}
          breadcrumb="VirtualMachine.metadata.name"
          data-test-id={`${vm?.metadata?.name}-name`}
          descriptionData={vm?.metadata?.name}
          descriptionHeader={t('Name')}
          isPopover
          moreInfoURL="http://kubernetes.io/docs/user-guide/identifiers#names"
        />
        <VirtualMachineDescriptionItem
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
          bodyContent={t(
            'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
          )}
          breadcrumb="VirtualMachine.metadata.namespace"
          descriptionData={<ResourceLink kind="Namespace" name={vm?.metadata?.namespace} />}
          descriptionHeader={t('Namespace')}
          isPopover
          moreInfoURL="http://kubernetes.io/docs/user-guide/namespaces"
        />
        <VirtualMachineDescriptionItem
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
          bodyContent={t(
            'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
          )}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <LabelsModal
                onLabelsSubmit={(labels) =>
                  k8sPatch({
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/labels',
                        value: labels,
                      },
                    ],
                    model: VirtualMachineModel,
                    resource: vm,
                  })
                }
                isOpen={isOpen}
                obj={vm}
                onClose={onClose}
              />
            ))
          }
          breadcrumb="VirtualMachine.metadata.labels"
          data-test-id={`${vm?.metadata?.name}-labels`}
          descriptionData={<VirtualMachineLabels labels={vm?.metadata?.labels} />}
          descriptionHeader={t('Labels')}
          editOnTitleJustify
          isEdit
          isPopover
          moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
          showEditOnTitle
        />
        <VirtualMachineDescriptionItem
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
          bodyContent={t(
            'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
          )}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <AnnotationsModal
                onSubmit={(updatedAnnotations) =>
                  k8sPatch({
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/annotations',
                        value: updatedAnnotations,
                      },
                    ],
                    model: VirtualMachineModel,
                    resource: vm,
                  })
                }
                isOpen={isOpen}
                obj={vm}
                onClose={onClose}
              />
            ))
          }
          breadcrumb="VirtualMachine.metadata.annotations"
          descriptionData={<VirtualMachineAnnotations annotations={vm?.metadata?.annotations} />}
          descriptionHeader={t('Annotations')}
          isEdit
          isPopover
          moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DescriptionModal
                isOpen={isOpen}
                obj={vm}
                onClose={onClose}
                onSubmit={updateDescription}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-description`}
          descriptionData={getAnnotation(vm, DESCRIPTION_ANNOTATION) || None}
          descriptionHeader={t('Description')}
          isEdit
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            (loadedGuestAgent &&
              !isEmpty(guestAgentData) &&
              getOsNameFromGuestAgent(guestAgentData)) || <GuestAgentIsRequiredText vmi={vmi} />
          }
          data-test-id={`${vm?.metadata?.name}-os`}
          // body-content text copied from:
          descriptionHeader={t('Operating system')}
          isPopover
        />
        <VirtualMachineDescriptionItem
          bodyContent={
            vm?.spec?.instancetype ? null : (
              <CPUDescription cpu={vm?.spec?.template?.spec?.domain?.cpu} />
            )
          }
          messageOnDisabled={t(
            'CPU and Memory can not be edited if the VirtualMachine is created from InstanceType',
          )}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <CPUMemoryModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-cpu-memory`}
          descriptionData={<CPUMemory vm={vm} />}
          descriptionHeader={t('CPU | Memory')}
          isDisabled={!!vm?.spec?.instancetype}
          isEdit={canUpdateVM}
          isPopover
        />
        <VirtualMachineDescriptionItem
          bodyContent={t(
            'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
          )}
          descriptionData={getMachineType(vm) || NO_DATA_DASH}
          descriptionHeader={t('Machine type')}
          isPopover
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            !canUpdateVM ? (
              <MutedTextSpan text={firmwareBootloaderTitle} />
            ) : (
              firmwareBootloaderTitle
            )
          }
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <FirmwareBootloaderModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id={`${vm?.metadata?.name}-boot-method`}
          descriptionHeader={t('Boot mode')}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          bodyContent={t(
            'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
          )}
          descriptionData={
            <Switch
              onChange={(checked) => {
                setIsChecked(checked);
                updateStartStrategy(checked);
              }}
              id="start-in-pause-mode"
              isChecked={isChecked}
            />
          }
          data-test-id="start-pause-mode"
          descriptionHeader={t('Start in pause mode')}
          isPopover
        />
        <VirtualMachineDescriptionItem
          descriptionData={
            templateName ? (
              <ResourceLink
                onClick={() =>
                  history.push(`/k8s/ns/${templateNamespace}/templates/${templateName}`)
                }
                groupVersionKind={modelToGroupVersionKind(TemplateModel)}
                name={templateName}
                namespace={templateNamespace}
              />
            ) : (
              None
            )
          }
          data-test-id={`${vm?.metadata?.name}-template`}
          descriptionHeader={t('Template')}
        />
        <VirtualMachineDescriptionItem
          // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L84
          bodyContent={t(
            'Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.',
          )}
          breadcrumb="VirtualMachine.metadata.creationTimestamp"
          descriptionData={<Timestamp timestamp={vm?.metadata?.creationTimestamp} />}
          descriptionHeader={t('Created at')}
          isPopover
        />
        <OwnerDetailsItem obj={vm} />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineDetailsLeftGrid;
