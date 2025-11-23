import { Map as ImmutableMap } from 'immutable';

export type ErrorType = {
  message?: string;
  moreInfo?: string;
  response?: Response;
};

export type Attachment = {
  attachmentType: string;
  isEditable?: boolean;
  kind: string;
  name: string;
  namespace: string;
  originalValue?: string;
  ownerName?: string;
  value: string;
};

export type ReferencedDoc = {
  doc_title: string;
  doc_url: string;
};

export type Tool = {
  args: { [key: string]: Array<string> };
  content: string;
  name: string;
  status: 'error' | 'success';
};

type ChatEntryUser = {
  attachments: { [key: string]: Attachment };
  text: string;
  who: 'user';
};

type ChatEntryAI = {
  error?: ErrorType;
  id: string;
  isCancelled: boolean;
  isStreaming: boolean;
  isTruncated: boolean;
  references?: Array<ReferencedDoc>;
  text?: string;
  tools?: ImmutableMap<string, Tool>;
  userFeedback?: ImmutableMap<string, object>;
  who: 'ai';
};

export type ChatEntry = ChatEntryAI | ChatEntryUser;
