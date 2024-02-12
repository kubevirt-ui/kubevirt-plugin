import * as React from 'react';

import { NodeModel, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { getAllowedResourceData } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceInventoryItem } from '@openshift-console/dynamic-plugin-sdk-internal';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { Stack, StackItem } from '@patternfly/react-core';

import './ResourcesSection.scss';

export type ResourcesSectionProps = {
  isAdmin?: boolean;
  resources?: WatchK8sResults<{
    [key: string]: K8sResourceCommon[];
  }>;
};

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ isAdmin, resources }) => {
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
    <Stack className="kv-inventory-card__resources--container" hasGutter>
      <StackItem key={VirtualMachineModel.kind}>
        <ResourceInventoryItem
          dataTest="kv-inventory-card--vms"
          error={!!vms?.loadError}
          isLoading={vms?.loaded === false}
          kind={VirtualMachineModel as K8sModel}
          resources={vms?.data as K8sResourceCommon[]}
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={TemplateModel.kind}>
        <ResourceInventoryItem
          basePath={`/k8s/all-namespaces/templates`}
          dataTest="kv-inventory-card--vm-templates"
          error={!!templates?.loadError}
          isLoading={templates?.loaded === false}
          kind={TemplateModel as K8sModel}
          resources={templates?.data}
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={NodeModel.kind}>
        <ResourceInventoryItem
          dataTest="kv-inventory-card--nodes"
          error={!!resources?.nodes?.loadError}
          isLoading={resources?.nodes?.loaded === false}
          kind={NodeModel as K8sModel}
          resources={resources?.nodes?.data}
          showLink={isAdmin}
        />
      </StackItem>
      <StackItem key={NetworkAttachmentDefinitionModel.kind}>
        <ResourceInventoryItem
          dataTest="kv-inventory-card--nads"
          error={!!nads?.loadError}
          isLoading={nads?.loaded === false}
          kind={NetworkAttachmentDefinitionModel as K8sModel}
          resources={nads?.data}
          showLink={isAdmin}
          title="Network"
          titlePlural="Networks"
        />
      </StackItem>
    </Stack>
  );
};

export default ResourcesSection;
