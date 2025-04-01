import React, { FC, ReactNode } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  NodeModel,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { get } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceKind,
  k8sUpdate,
  ResourceLink,
  useAccessReview,
  useAnnotationsModal,
  useK8sWatchResource,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  getGroupVersionKindForModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import DetailsItem from './components/DetailsItem';
import LabelList from './components/LabelList/LabelList';
import Selector from './components/Selector';
import { Toleration } from './utils/types';
import { getTolerationsPath } from './utils/utils';

export type ResourceSummaryProps = {
  canUpdateResource?: boolean;
  children?: ReactNode;
  customPathName?: string;
  nodeSelector?: string;
  podSelector?: string;
  resource: K8sResourceKind;
  showAnnotations?: boolean;
  showLabelEditor?: boolean;
  showNodeSelector?: boolean;
  showPodSelector?: boolean;
  showTolerations?: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const ResourceSummary: FC<ResourceSummaryProps> = ({
  canUpdateResource = true,
  children,
  customPathName,
  nodeSelector = 'spec.template.spec.nodeSelector',
  podSelector = 'spec.selector',
  resource,
  showAnnotations = true,
  showLabelEditor = true,
  showNodeSelector = false,
  showPodSelector = false,
  showTolerations = false,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const annotationsModalLauncher = useAnnotationsModal(resource);
  const labelsModalLauncher = useLabelsModal(resource);

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });

  const { metadata } = resource;
  const name = getName(resource);
  const namespace = getNamespace(resource);
  const reference = getGroupVersionKindForResource(resource);
  const model = getK8sModel(reference);
  const canUpdateAccess = useAccessReview({
    group: model.apiGroup,
    name: name,
    namespace: namespace,
    resource: model.plural,
    verb: 'patch',
  });
  const canUpdate = canUpdateAccess && canUpdateResource;

  const tolerationsPath = getTolerationsPath(resource);
  const tolerations: Toleration[] = (resource as any)?.tolerationsPath;

  return (
    <dl className="co-m-pane__details" data-test-id="resource-summary">
      <DetailsItem label={t('Name')} obj={resource} path={customPathName || 'name'} />
      {namespace && (
        <DetailsItem label={t('Namespace')} obj={resource} path="namespace">
          <ResourceLink
            groupVersionKind={getGroupVersionKindForModel(NamespaceModel)}
            name={namespace}
            namespace={null}
            title={metadata.uid}
          />
        </DetailsItem>
      )}
      <DetailsItem
        canEdit={showLabelEditor && canUpdate}
        editAsGroup
        label={t('Labels')}
        obj={resource}
        onEdit={labelsModalLauncher}
        path="metadata.labels"
        valueClassName="details-item__value--labels"
      >
        <LabelList kind={reference} labels={metadata.labels} />
      </DetailsItem>
      {showPodSelector && (
        <DetailsItem label={t('Pod selector')} obj={resource} path={podSelector}>
          <Selector namespace={get(resource, 'namespace')} selector={get(resource, podSelector)} />
        </DetailsItem>
      )}
      {showNodeSelector && (
        <DetailsItem label={t('Node selector')} obj={resource} path={nodeSelector}>
          <Selector kind={t('Node')} selector={get(resource, nodeSelector)} />
        </DetailsItem>
      )}
      {showTolerations && (
        <DetailsItem label={t('Tolerations')} obj={resource} path={tolerationsPath}>
          {canUpdate ? (
            <Button
              onClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <TolerationsModal
                    isOpen={isOpen}
                    nodes={nodes}
                    nodesLoaded={nodesLoaded}
                    onClose={onClose}
                    onSubmit={onSubmit}
                    vm={vm}
                    vmi={vmi}
                  />
                ))
              }
              isInline
              type="button"
              variant="link"
            >
              {t('{{count}} toleration', { count: tolerations?.length })}
              <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
            </Button>
          ) : (
            t('{{count}} toleration', { count: tolerations?.length })
          )}
        </DetailsItem>
      )}
      {showAnnotations && (
        <DetailsItem label={t('Annotations')} obj={resource} path="metadata.annotations">
          {canUpdate ? (
            <Button
              data-test="edit-annotations"
              isInline
              onClick={annotationsModalLauncher}
              type="button"
              variant="link"
            >
              {t('{{count}} annotation', { count: Object.keys(metadata.annotations)?.length })}
              <PencilAltIcon className="co-icon-space-l pf-v5-c-button-icon--plain" />
            </Button>
          ) : (
            t('{{count}} annotation', { count: Object.keys(metadata.annotations)?.length })
          )}
        </DetailsItem>
      )}
      {children}
      <DetailsItem label={t('Created at')} obj={resource} path="metadata.creationTimestamp">
        <Timestamp timestamp={metadata.creationTimestamp} />
      </DetailsItem>
      <DetailsItem label={t('Owner')} obj={resource} path="metadata.ownerReferences">
        <OwnerReferences obj={resource} />
      </DetailsItem>
    </dl>
  );
};

export default ResourceSummary;
