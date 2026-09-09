export enum EnvironmentKind {
  ConfigMap = 'configMap',
  Secret = 'secret',
  ServiceAccount = 'serviceAccount',
}

export type EnvironmentVariable = {
  diskName: string;
  kind: EnvironmentKind;
  name: string;
  serial: string;
};

export const MapKindToAbbr: Record<EnvironmentKind, string> = {
  [EnvironmentKind.ConfigMap]: 'CM',
  [EnvironmentKind.Secret]: 'S',
  [EnvironmentKind.ServiceAccount]: 'SA',
};
