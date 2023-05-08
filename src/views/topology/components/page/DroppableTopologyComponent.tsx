import React, { useContext } from 'react';
import { DndProvider, DropTargetMonitor } from 'react-dnd';

import { Model } from '@patternfly/react-topology';

import { FileUploadContext, FileUploadContextType } from '../../utils/contexts/FileUploadContext';
import useDragDropContext from '../../utils/hooks/useDragDropContext';
import { TopologyViewType } from '../../utils/types/topology-types';

import DroppableTopology from './DroppableTopology';

export const DroppableTopologyComponent = (props) => {
  const dndContextManager = useDragDropContext();
  const { setFileUpload, extensions } = useContext<FileUploadContextType>(FileUploadContext);

  const handleFileDrop = (monitor: DropTargetMonitor) => {
    if (!monitor) {
      return;
    }
    const [file] = monitor.getItem().files;
    if (!file) {
      return;
    }
    setFileUpload(file);
  };

  return (
    <DndProvider manager={dndContextManager}>
      <DroppableTopology {...props} onDrop={handleFileDrop} canDropFile={extensions.length > 0} />
    </DndProvider>
  );
};

export type DroppableTopologyComponentProps = {
  model: Model;
  namespace: string;
  viewType: TopologyViewType;
};
