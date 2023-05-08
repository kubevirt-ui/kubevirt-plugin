import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, Tooltip } from '@patternfly/react-core';
import { ListIcon, QuestionCircleIcon, TopologyIcon } from '@patternfly/react-icons';
import { observer } from '@patternfly/react-topology';

import { ExtensibleModel, ModelContext } from '../../data-transforms/ModelContext';
import { FileUploadContext, FileUploadContextType } from '../../utils/contexts/FileUploadContext';
import { ALL_IMPORT_RESOURCE_ACCESS } from '../../utils/knative/knative-const';
import { TopologyViewType } from '../../utils/types/topology-types';
import { getTopologyShortcuts } from '../graph-view/TopologyShortcuts';

import useAddToProjectAccess from './TopologyPageToolbar/hooks/useAddToProjectAccess/useAddToProjectAccess';
import useIsMobile from './TopologyPageToolbar/hooks/useIsMobile/useIsMobile';

interface TopologyPageToolbarProps {
  viewType: TopologyViewType;
  onViewChange: (view: TopologyViewType) => void;
}

const TopologyPageToolbar: React.FC<TopologyPageToolbarProps> = observer(
  function TopologyPageToolbar({ viewType, onViewChange }) {
    const { t } = useKubevirtTranslation();
    const isMobile = useIsMobile();
    const { extensions } = React.useContext<FileUploadContextType>(FileUploadContext);
    const showGraphView = viewType === TopologyViewType.graph;
    const dataModelContext = React.useContext<ExtensibleModel>(ModelContext);
    const { namespace, isEmptyModel } = dataModelContext;
    const createResourceAccess: string[] = useAddToProjectAccess(namespace);
    const allImportAccess = createResourceAccess.includes(ALL_IMPORT_RESOURCE_ACCESS);
    const viewChangeTooltipContent = showGraphView ? t('List view') : t('Graph view');

    if (!namespace) {
      return null;
    }

    return (
      <>
        {!isMobile ? (
          <Popover
            aria-label={t('Shortcuts')}
            bodyContent={getTopologyShortcuts(t, {
              supportedFileTypes: extensions,
              isEmptyModel,
              viewType,
              allImportAccess,
            })}
            position="left"
            maxWidth="100vw"
          >
            <Button
              type="button"
              variant="link"
              className="odc-topology__shortcuts-button"
              icon={<QuestionCircleIcon />}
              data-test-id="topology-view-shortcuts"
            >
              {t('View shortcuts')}
            </Button>
          </Popover>
        ) : null}
        <Tooltip position="left" content={viewChangeTooltipContent}>
          <Button
            variant="link"
            aria-label={viewChangeTooltipContent}
            className="pf-m-plain odc-topology__view-switcher"
            data-test-id="topology-switcher-view"
            isDisabled={isEmptyModel}
            onClick={() =>
              onViewChange(showGraphView ? TopologyViewType.list : TopologyViewType.graph)
            }
          >
            {showGraphView ? <ListIcon size="md" /> : <TopologyIcon size="md" />}
          </Button>
        </Tooltip>
      </>
    );
  },
);

export default TopologyPageToolbar;
