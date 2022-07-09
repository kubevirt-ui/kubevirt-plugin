export enum EnvironmentKind {
  secret = 'secret',
  serviceAccount = 'serviceAccount',
  configMap = 'configMap',
}

export type EnvironmentVariable = {
  name: string;
  serial: string;
  kind: EnvironmentKind;
};

export const MapKindToAbbr = {
  [EnvironmentKind.secret]: 'S',
  [EnvironmentKind.configMap]: 'CM',
  [EnvironmentKind.serviceAccount]: 'SA',
};
