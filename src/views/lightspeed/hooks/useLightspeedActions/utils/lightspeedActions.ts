import { action } from 'typesafe-actions';

import { Attachment, ChatEntry, Tool } from '@lightspeed/hooks/useLightspeedActions/utils/types';

export enum OLSActionType {
  AttachmentSet = 'attachmentSet',
  ChatHistoryPush = 'chatHistoryPush',
  ChatHistoryUpdateByID = 'chatHistoryUpdateByID',
  ChatHistoryUpdateTool = 'chatHistoryUpdateTool',
  CloseOLS = 'closeOLS',
  OpenOLS = 'openOLS',
  SetConversationID = 'setConversationID',
  SetQuery = 'setQuery',
}

export const closeOLSDrawer = () => action(OLSActionType.CloseOLS);

export const openOLSDrawer = () => action(OLSActionType.OpenOLS);

export const setQuery = (query: string) => action(OLSActionType.SetQuery, { query });

export const pushChatHistory = (entry: ChatEntry) =>
  action(OLSActionType.ChatHistoryPush, { entry });

export const updateChatHistoryByID = (id: string, entry: Partial<ChatEntry>) =>
  action(OLSActionType.ChatHistoryUpdateByID, { entry, id });

export const updateChatHistoryTool = (id: string, toolID: string, tool: Partial<Tool>) =>
  action(OLSActionType.ChatHistoryUpdateTool, { id, tool, toolID });

export const setAttachment = (attachment: Attachment) =>
  action(OLSActionType.AttachmentSet, attachment);

export const setConversationID = (id: string) => action(OLSActionType.SetConversationID, { id });
