import React from 'react';

import { NodeModel, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Grid, GridItem } from '@patternfly/react-core';

import useResourcesQuantities from './hooks/useResourcesQuantities';
import ResourceInventoryItem from './ResourceInventoryItem';

import './ResourcesInventoryCard.scss';

const ResourcesInventoryCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { nads, nodes, vms, vmTemplates } = useResourcesQuantities();
  const [activeNamespace] = useActiveNamespace();

  return (
    <div className="resources-inventory-card" data-test-id="resources-inventory-card">
      <Grid className="resources-inventory-card__grid" hasGutter>
        <GridItem>
          <Card className="resources-inventory-card__grid-item">
            <ResourceInventoryItem
              label={t('VirtualMachines')}
              path={getResourceUrl({ activeNamespace, model: VirtualMachineModel })}
              quantity={vms}
            />
          </Card>
        </GridItem>
        <GridItem>
          <Card className="resources-inventory-card__grid-item">
            <ResourceInventoryItem
              label={t('Templates')}
              path={getResourceUrl({ activeNamespace, model: TemplateModel })}
              quantity={vmTemplates}
            />
          </Card>
        </GridItem>
        {isAdmin && (
          <GridItem>
            <Card className="resources-inventory-card__grid-item">
              <ResourceInventoryItem
                label={t('Nodes')}
                path={getResourceUrl({ model: NodeModel })}
                quantity={nodes}
              />
            </Card>
          </GridItem>
        )}
        <GridItem>
          <Card className="resources-inventory-card__grid-item">
            <ResourceInventoryItem
              label={t('Networks')}
              path={getResourceUrl({ activeNamespace, model: NetworkAttachmentDefinitionModel })}
              quantity={nads}
            />
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default ResourcesInventoryCard;
