import * as React from 'react';

import { NodeModel, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { K8sResourceCommon, WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceInventoryItem } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Stack, StackItem } from '@patternfly/react-core';
import { InventoryCardResources } from './types';
import { getOSImagesNS, getTemplates } from './utils';

import './ResourcesSection.scss';

export type ResourcesSectionProps = {
  resources?: WatchK8sResults<InventoryCardResources>;
};

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources }) => {
  const templates = React.useMemo(() => getTemplates(resources), [resources]);
  const dataSourceNS = React.useMemo(() => getOSImagesNS(), []);

  return (
    <Stack hasGutter className="kv-inventory-card__resources--container">
      <StackItem key={VirtualMachineModel.kind}>
        <ResourceInventoryItem
          resources={resources?.vms?.data as K8sResourceCommon[]}
          kind={VirtualMachineModel}
          isLoading={resources?.vms?.loaded === false}
          error={!!resources?.vms?.loadError}
          dataTest="kv-inventory-card--vms"
        />
      </StackItem>
      <StackItem key={TemplateModel.kind}>
        <ResourceInventoryItem
          resources={templates as K8sResourceCommon[]}
          kind={TemplateModel}
          isLoading={resources?.vmCommonTemplates?.loaded === false}
          error={!!resources?.vmCommonTemplates?.loadError}
          dataTest="kv-inventory-card--vm-templates"
          basePath={`/k8s/ns/${dataSourceNS}/virtualmachinetemplates`}
        />
      </StackItem>
      <StackItem key={NodeModel.kind}>
        <ResourceInventoryItem
          resources={resources?.nodes?.data as K8sResourceCommon[]}
          kind={NodeModel}
          isLoading={resources?.nodes?.loaded === false}
          error={!!resources?.nodes?.loadError}
          dataTest="kv-inventory-card--nodes"
        />
      </StackItem>
      <StackItem key={NetworkAttachmentDefinitionModel.kind}>
        <ResourceInventoryItem
          resources={resources?.nads?.data as K8sResourceCommon[]}
          kind={NetworkAttachmentDefinitionModel}
          title="Network"
          titlePlural="Networks"
          isLoading={resources?.nads?.loaded === false}
          error={!!resources?.nads?.loadError}
          dataTest="kv-inventory-card--nads"
        />
      </StackItem>
    </Stack>
  );
};

export default ResourcesSection;
