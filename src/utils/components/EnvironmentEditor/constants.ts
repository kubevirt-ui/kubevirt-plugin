export enum EnvironmentKind {
  configMap = 'configMap',
  secret = 'secret',
  serviceAccount = 'serviceAccount',
}

export type EnvironmentVariable = {
  diskName: string;
  kind: EnvironmentKind;
  name: string;
  serial: string;
};

export const MapKindToAbbr = {
  [EnvironmentKind.configMap]: 'CM',
  [EnvironmentKind.secret]: 'S',
  [EnvironmentKind.serviceAccount]: 'SA',
};
