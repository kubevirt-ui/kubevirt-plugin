import * as React from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  TemplateModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardHeader, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import { K8sResourceKind } from '../details-card/utils/types';

import ResourcesSection from './utils/ResourcesSection';
import { InventoryCardResources } from './utils/types';
import VMStatusSection from './utils/vm-status-section/VMStatusSection';

import './InventoryCard.scss';

const InventoryCard: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const watchedResources = {
    vms: {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      namespaced: true,
      isList: true,
    },
    vmTemplates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      isList: true,
      selector: {
        matchExpressions: [
          {
            key: TEMPLATE_TYPE_LABEL,
            operator: 'Exists',
          },
        ],
      },
    },
    vmCommonTemplates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      isList: true,
      namespace: 'openshift',
      selector: {
        matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE },
      },
    },
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      namespaced: false,
      isList: true,
    },
    nads: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      namespaced: false,
      isList: true,
    },
  };

  const resources = useK8sWatchResources<InventoryCardResources>(watchedResources);

  return (
    <Card data-test-id="kv-running-inventory-card">
      <CardHeader>
        <CardTitle>{t('Inventory')}</CardTitle>
      </CardHeader>
      <div className="kv-inventory-card__body">
        <Grid>
          <GridItem span={4}>
            <div className="kv-inventory-card__item kv-inventory-card__section-header">
              <div className="kv-inventory-card__item-section kv-inventory-card__item--border-right">
                <span className="kv-inventory-card__item-text">{t('Resources')}</span>
              </div>
            </div>
          </GridItem>
          <GridItem span={8}>
            <div className="kv-inventory-card__item kv-inventory-card__section-header">
              <div className="kv-inventory-card__item-section">
                <span className="kv-inventory-card__item-text">{t('VM statuses')}</span>
              </div>
            </div>
          </GridItem>
          <GridItem span={4}>
            <div className="kv-inventory-card__item">
              <div className="kv-inventory-card__item-section kv-inventory-card__item--border-right">
                <span className="kv-inventory-card__item-text">
                  <ResourcesSection resources={resources} />
                </span>
              </div>
            </div>
          </GridItem>
          <GridItem span={8}>
            <VMStatusSection
              vms={(resources?.vms?.data as K8sResourceKind[]) ?? []}
              vmsLoaded={resources?.vms?.loaded}
            />
          </GridItem>
        </Grid>
      </div>
    </Card>
  );
};

export default InventoryCard;
