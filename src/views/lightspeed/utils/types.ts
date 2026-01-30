export enum OLSAttachmentTypes {
  Events = 'Events',
  Log = 'Log',
  YAML = 'YAML',
  YAMLFiltered = 'YAML filtered',
  YAMLUpload = 'YAMLUpload',
}

export type OLSAttachment = {
  attachmentType: OLSAttachmentTypes;
  kind: string | undefined;
  name: string | undefined;
  namespace: string | undefined;
  ownerName: string | undefined;
  value: string | undefined;
};
