import { useDispatch } from 'react-redux';

import {
  attachmentsClear,
  clearContextEvents,
  closeOLSDrawer,
  openOLSDrawer,
  pushChatHistory,
  setAttachment,
  setConversationID,
  setQuery,
  updateChatHistoryByID,
  updateChatHistoryTool,
} from '@lightspeed/hooks/useLightspeedActions/utils/lightspeedActions';
import { Attachment, ChatEntry, Tool } from '@lightspeed/hooks/useLightspeedActions/utils/types';

type UseLightspeedActions = () => {
  clearAttachments: () => void;
  clearContextEvents: () => void;
  closeOLSDrawer: () => void;
  openOLSDrawer: () => void;
  pushChatHistory: (entry: ChatEntry) => void;
  setAttachment: (attachment: Attachment) => void;
  setConversationID: (id: string) => void;
  setQuery: (query: string) => void;
  updateChatHistoryByID: (id: string, entry: Partial<ChatEntry>) => void;
  updateChatHistoryTool: (id: string, toolID: string, tool: Partial<Tool>) => void;
};

const useLightspeedActions: UseLightspeedActions = () => {
  const dispatch = useDispatch();

  return {
    clearAttachments: () => dispatch(attachmentsClear()),
    clearContextEvents: () => dispatch(clearContextEvents()),
    closeOLSDrawer: () => dispatch(closeOLSDrawer()),
    openOLSDrawer: () => dispatch(openOLSDrawer()),
    pushChatHistory: (entry: ChatEntry) => dispatch(pushChatHistory(entry)),
    setAttachment: (attachment: Attachment) => dispatch(setAttachment(attachment)),
    setConversationID: (id: string) => dispatch(setConversationID(id)),
    setQuery: (query: string) => dispatch(setQuery(query)),
    updateChatHistoryByID: (id: string, entry: Partial<ChatEntry>) =>
      dispatch(updateChatHistoryByID(id, entry)),
    updateChatHistoryTool: (id: string, toolID: string, tool: Partial<Tool>) =>
      dispatch(updateChatHistoryTool(id, toolID, tool)),
  };
};

export default useLightspeedActions;
