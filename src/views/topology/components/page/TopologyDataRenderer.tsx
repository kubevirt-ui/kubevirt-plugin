import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBox } from '@console/internal/components/hooks';
import { observer } from '@patternfly/react-topology';

import { ExtensibleModel, ModelContext } from '../../data-transforms/ModelContext';
import { TopologyViewType } from '../../utils/types/topology-types';

import { DroppableTopologyComponent } from './DroppableTopologyComponent';

interface TopologyDataRendererProps {
  viewType: TopologyViewType;
}

const TopologyDataRenderer: React.FC<TopologyDataRendererProps> = observer(
  function TopologyDataRenderer({ viewType }) {
    const { t } = useTranslation();
    const { namespace, model, loaded, loadError } = React.useContext<ExtensibleModel>(ModelContext);

    return (
      <StatusBox
        skeleton={
          viewType === TopologyViewType.list && (
            <div className="co-m-pane__body skeleton-overview">
              <div className="skeleton-overview--head" />
              <div className="skeleton-overview--tile" />
              <div className="skeleton-overview--tile" />
              <div className="skeleton-overview--tile" />
            </div>
          )
        }
        data={model}
        label={t('kubevirt-plugin~Topology')}
        loaded={loaded}
        loadError={loadError}
      >
        <DroppableTopologyComponent viewType={viewType} model={model} namespace={namespace} />
      </StatusBox>
    );
  },
);

export default TopologyDataRenderer;
