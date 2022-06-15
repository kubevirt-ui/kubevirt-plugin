import * as React from 'react';

import { NodeModel, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { K8sResourceCommon, WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceInventoryItem } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Stack, StackItem } from '@patternfly/react-core';

import { getAllowedResourceData } from '../../../utils/utils';

import './ResourcesSection.scss';

export type ResourcesSectionProps = {
  resources?: WatchK8sResults<{
    [key: string]: K8sResourceCommon[];
  }>;
  isAdmin?: boolean;
};

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources, isAdmin }) => {
  const templates = React.useMemo(
    () => (isAdmin ? resources?.vmTemplates : getAllowedResourceData(resources, TemplateModel)),
    [resources, isAdmin],
  );
  const vms = React.useMemo(
    () => (isAdmin ? resources?.vms : getAllowedResourceData(resources, VirtualMachineModel)),
    [resources, isAdmin],
  );
  const nads = React.useMemo(
    () =>
      isAdmin
        ? resources?.nads
        : getAllowedResourceData(resources, NetworkAttachmentDefinitionModel),
    [resources, isAdmin],
  );

  return (
    <Stack hasGutter className="kv-inventory-card__resources--container">
      <StackItem key={VirtualMachineModel.kind}>
        <ResourceInventoryItem
          resources={vms?.data as K8sResourceCommon[]}
          kind={VirtualMachineModel}
          isLoading={vms?.loaded === false}
          error={!!vms?.loadError}
          dataTest="kv-inventory-card--vms"
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={TemplateModel.kind}>
        <ResourceInventoryItem
          resources={templates?.data}
          kind={TemplateModel}
          isLoading={templates?.loaded === false}
          error={!!templates?.loadError}
          dataTest="kv-inventory-card--vm-templates"
          basePath={`/k8s/all-namespaces/templates`}
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={NodeModel.kind}>
        <ResourceInventoryItem
          resources={resources?.nodes?.data}
          kind={NodeModel}
          isLoading={resources?.nodes?.loaded === false}
          error={!!resources?.nodes?.loadError}
          dataTest="kv-inventory-card--nodes"
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={NetworkAttachmentDefinitionModel.kind}>
        <ResourceInventoryItem
          resources={nads?.data}
          kind={NetworkAttachmentDefinitionModel}
          title="Network"
          titlePlural="Networks"
          isLoading={nads?.loaded === false}
          error={!!nads?.loadError}
          dataTest="kv-inventory-card--nads"
          showLink={isAdmin}
        />
      </StackItem>
    </Stack>
  );
};

export default ResourcesSection;
