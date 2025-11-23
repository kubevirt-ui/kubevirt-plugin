import { useDispatch } from 'react-redux';

import {
  closeOLSDrawer,
  openOLSDrawer,
  pushChatHistory,
  setConversationID,
  setQuery,
  updateChatHistoryByID,
  updateChatHistoryTool,
} from '@lightspeed/hooks/useLightspeedActions/utils/lightspeedActions';
import { ChatEntry, Tool } from '@lightspeed/hooks/useLightspeedActions/utils/types';

type UseLightspeedActions = () => {
  closeOLSDrawer: () => void;
  openOLSDrawer: () => void;
  pushChatHistory: (entry: ChatEntry) => void;
  setConversationID: (id: string) => void;
  setQuery: (query: string) => void;
  updateChatHistoryByID: (id: string, entry: Partial<ChatEntry>) => void;
  updateChatHistoryTool: (id: string, toolID: string, tool: Partial<Tool>) => void;
};

const useLightspeedActions: UseLightspeedActions = () => {
  const dispatch = useDispatch();

  return {
    closeOLSDrawer: () => dispatch(closeOLSDrawer()),
    openOLSDrawer: () => dispatch(openOLSDrawer()),
    pushChatHistory: (entry: ChatEntry) => dispatch(pushChatHistory(entry)),
    setConversationID: (id: string) => dispatch(setConversationID(id)),
    setQuery: (query: string) => dispatch(setQuery(query)),
    updateChatHistoryByID: (id: string, entry: Partial<ChatEntry>) =>
      dispatch(updateChatHistoryByID(id, entry)),
    updateChatHistoryTool: (id: string, toolID: string, tool: Partial<Tool>) =>
      dispatch(updateChatHistoryTool(id, toolID, tool)),
  };
};

export default useLightspeedActions;
