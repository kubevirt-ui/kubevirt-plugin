import { useRef } from 'react';
import { createDndContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropManager } from 'dnd-core';

const dndContext = createDndContext(HTML5Backend);

type UseDragDropContext = () => DragDropManager;

const useDragDropContext: UseDragDropContext = () => {
  const manager = useRef(dndContext);
  return manager?.current?.dragDropManager;
};

export default useDragDropContext;
