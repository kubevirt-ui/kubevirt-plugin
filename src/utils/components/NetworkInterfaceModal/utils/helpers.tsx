export {
  deleteNetworkInterface,
  getNadFullName,
  getNADRole,
  getNadType,
  getNameAndNs,
  getPASSTSelectableOptions,
  isNadFullName,
  isNADUsedInVM,
  isOvnOverlayNad,
  parseNADConfig,
} from './nadHelpers';
export {
  createInterface,
  createNetwork,
  getNetworkName,
  getNextBootOrder,
  hasExplicitlyDefinedPodNetwork,
  isPodNetworkName,
  markOneInterfaceAbsent,
  type NICBootOrderPreparation,
  podNetworkExists,
  prepareNICBootOrder,
} from './networkInterfaceHelpers';
