import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardHeader, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import {
  getAllowedResourceData,
  getAllowedResources,
  getAllowedTemplateResources,
} from '../../utils/utils';
import { useProjectNames } from '../running-vms-per-template-card/hooks/useRunningVMsPerTemplateResources';

import ResourcesSection from './utils/ResourcesSection';
import VMStatusSection from './utils/vm-status-section/VMStatusSection';

import './InventoryCard.scss';

const InventoryCard: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const projectNames = useProjectNames();
  const allowedVMResources = getAllowedResources(projectNames, VirtualMachineModel);
  const allowedNADResources = getAllowedResources(projectNames, NetworkAttachmentDefinitionModel);
  const allowedTemplateResources = getAllowedTemplateResources(projectNames);

  const watchedResources = {
    ...allowedVMResources,
    ...allowedTemplateResources,
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      namespaced: false,
      isList: true,
    },
    ...allowedNADResources,
  };

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const vms = getAllowedResourceData(resources, VirtualMachineModel);

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
            <VMStatusSection vms={vms?.data ?? []} vmsLoaded={vms?.loaded} />
          </GridItem>
        </Grid>
      </div>
    </Card>
  );
};

export default InventoryCard;
