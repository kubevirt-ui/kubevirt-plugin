import { action, type EmptyAction, type PayloadAction } from 'typesafe-actions';

import {
  type Attachment,
  type ChatEntry,
  type Tool,
} from '@lightspeed/hooks/useLightspeedActions/utils/types';

export enum OLSActionType {
  AttachmentsClear = 'attachmentsClear',
  AttachmentSet = 'attachmentSet',
  ChatHistoryPush = 'chatHistoryPush',
  ChatHistoryUpdateByID = 'chatHistoryUpdateByID',
  ChatHistoryUpdateTool = 'chatHistoryUpdateTool',
  ClearContextEvents = 'clearContextEvents',
  CloseOLS = 'closeOLS',
  OpenOLS = 'openOLS',
  SetConversationID = 'setConversationID',
  SetQuery = 'setQuery',
}

export const attachmentsClear = (): EmptyAction<OLSActionType.AttachmentsClear> =>
  action(OLSActionType.AttachmentsClear);

export const clearContextEvents = (): EmptyAction<OLSActionType.ClearContextEvents> =>
  action(OLSActionType.ClearContextEvents);

export const closeOLSDrawer = (): EmptyAction<OLSActionType.CloseOLS> =>
  action(OLSActionType.CloseOLS);

export const openOLSDrawer = (): EmptyAction<OLSActionType.OpenOLS> =>
  action(OLSActionType.OpenOLS);

export const setQuery = (query: string): PayloadAction<OLSActionType.SetQuery, { query: string }> =>
  action(OLSActionType.SetQuery, { query });

export const pushChatHistory = (
  entry: ChatEntry,
): PayloadAction<OLSActionType.ChatHistoryPush, { entry: ChatEntry }> =>
  action(OLSActionType.ChatHistoryPush, { entry });

export const updateChatHistoryByID = (
  id: string,
  entry: Partial<ChatEntry>,
): PayloadAction<OLSActionType.ChatHistoryUpdateByID, { entry: Partial<ChatEntry>; id: string }> =>
  action(OLSActionType.ChatHistoryUpdateByID, { entry, id });

export const updateChatHistoryTool = (
  id: string,
  toolID: string,
  tool: Partial<Tool>,
): PayloadAction<
  OLSActionType.ChatHistoryUpdateTool,
  { id: string; tool: Partial<Tool>; toolID: string }
> => action(OLSActionType.ChatHistoryUpdateTool, { id, tool, toolID });

export const setAttachment = (
  attachment: Attachment,
): PayloadAction<OLSActionType.AttachmentSet, Attachment> =>
  action(OLSActionType.AttachmentSet, attachment);

export const setConversationID = (
  id: string,
): PayloadAction<OLSActionType.SetConversationID, { id: string }> =>
  action(OLSActionType.SetConversationID, { id });
