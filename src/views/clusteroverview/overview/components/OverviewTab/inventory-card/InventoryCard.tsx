import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardHeader, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import { getAllowedResourceData } from '../../../utils/utils';

import { useWatchedResourcesHook } from './hooks/useWatchedResourcesInventoryCard';
import ResourcesSection from './utils/ResourcesSection';
import VMStatusSection from './utils/vm-status-section/VMStatusSection';

import './InventoryCard.scss';

const InventoryCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();

  const useWatchedResourcesInventoryCard = useWatchedResourcesHook(isAdmin);
  const watchedResources = useWatchedResourcesInventoryCard();

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const vms = isAdmin ? resources?.vms : getAllowedResourceData(resources, VirtualMachineModel);

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
                <span className="kv-inventory-card__item-text">
                  {t('VirtualMachines statuses')}
                </span>
              </div>
            </div>
          </GridItem>
          <GridItem span={4}>
            <div className="kv-inventory-card__item">
              <div className="kv-inventory-card__item-section kv-inventory-card__item--border-right">
                <span className="kv-inventory-card__item-text">
                  <ResourcesSection resources={resources} isAdmin={isAdmin} />
                </span>
              </div>
            </div>
          </GridItem>
          <GridItem span={8}>
            <VMStatusSection vms={vms?.data || []} vmsLoaded={vms?.loaded} />
          </GridItem>
        </Grid>
      </div>
    </Card>
  );
};

export default InventoryCard;
