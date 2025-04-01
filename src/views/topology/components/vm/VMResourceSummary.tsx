import React, { FC } from 'react';

import { NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getAnnotations,
  getCreationTimestamp,
  getDescription,
  getLabel,
  getLabels,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getOSNameFromGuestAgent, useGuestOS } from '@kubevirt-utils/resources/vmi';
import {
  K8sModel,
  ResourceLink,
  useAccessReview,
  useAnnotationsModal,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  getGroupVersionKindForModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { updateDescription } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { getBasicID, prefixedID } from '../../utils/utils';
import DetailsItem from '../ResourceSummary/components/DetailsItem';
import LabelList from '../ResourceSummary/components/LabelList/LabelList';
import VMEditWithPencil from '../VMEditWithPencil';

import VMDetailsItem from './VMDetailsList/components/VMDetailsItem';
import VMDetailsItemTemplate from './VMDetailsItemTemplate';

type VMResourceSummaryProps = {
  canUpdateVM: boolean;
  kindObj: K8sModel;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VMResourceSummary: FC<VMResourceSummaryProps> = ({ canUpdateVM, kindObj, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const annotationsModalLauncher = useAnnotationsModal(vm);
  const labelsModalLauncher = useLabelsModal(vm);

  const name = getName(vm);
  const namespace = getNamespace(vm);
  const reference = getGroupVersionKindForResource(vm);
  const model = getK8sModel(reference);
  const [canUpdate] = useAccessReview({
    group: model.apiGroup,
    name: name,
    namespace: namespace,
    resource: model.plural,
    verb: 'patch',
  });

  const isVM = kindObj === VirtualMachineModel;
  const vmiLike = isVM ? vm : vmi;

  const templateName = getLabel(vm, LABEL_USED_TEMPLATE_NAME);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);

  const id = getBasicID(vmiLike);
  const description = getDescription(vmiLike);
  const os = getOperatingSystemName(vmiLike) || getOperatingSystem(vmiLike);

  const [guestAgentInfo] = useGuestOS(vmi);
  const operatingSystem = getOSNameFromGuestAgent(guestAgentInfo);

  const annotations = getAnnotations(vm);

  return (
    <dl className="co-m-pane__details" data-test-id="resource-summary">
      <DetailsItem label={t('Name')} obj={vm} path={'name'} />
      {namespace && (
        <DetailsItem label={t('Namespace')} obj={vm} path="namespace">
          <ResourceLink
            groupVersionKind={getGroupVersionKindForModel(NamespaceModel)}
            name={namespace}
            namespace={null}
            title={vm?.metadata?.uid}
          />
        </DetailsItem>
      )}

      <DetailsItem
        canEdit={canUpdate}
        editAsGroup
        label={t('Labels')}
        obj={vm}
        onEdit={labelsModalLauncher}
        path="metadata.labels"
        valueClassName="details-item__value--labels"
      >
        <LabelList kind={reference} labels={getLabels(vm)} />
      </DetailsItem>

      <DetailsItem label={t('Annotations')} obj={vm} path="metadata.annotations">
        {canUpdate ? (
          <Button
            data-test="edit-annotations"
            isInline
            onClick={annotationsModalLauncher}
            type="button"
            variant="link"
          >
            {t('{{count}} annotation', { count: Object.keys(annotations)?.length })}
            <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
          </Button>
        ) : (
          t('{{count}} annotation', { count: Object.keys(annotations)?.length })
        )}
      </DetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'description')}
        title={t('Description')}
        valueClassName="kubevirt-vm-resource-summary__description"
      >
        {!description && <span className="text-secondary">{t('Not available')}</span>}
        <VMEditWithPencil
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DescriptionModal
                isOpen={isOpen}
                obj={vm}
                onClose={onClose}
                onSubmit={(vmDescription: string) => updateDescription(vm, vmDescription)}
              />
            ))
          }
          isEdit={canUpdateVM}
        >
          {description}
        </VMEditWithPencil>
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'os')}
        isNotAvail={!(operatingSystem || os)}
        title={t('Operating system')}
      >
        {operatingSystem || os}
      </VMDetailsItem>

      {isVM && <VMDetailsItemTemplate name={templateName} namespace={templateNamespace} />}

      <DetailsItem label={t('Created at')} obj={vm} path="metadata.creationTimestamp">
        <Timestamp timestamp={getCreationTimestamp(vm)} />
      </DetailsItem>
      <DetailsItem label={t('Owner')} obj={vm} path="metadata.ownerReferences">
        <OwnerReferences obj={vm} />
      </DetailsItem>
    </dl>
  );
};

export default VMResourceSummary;
