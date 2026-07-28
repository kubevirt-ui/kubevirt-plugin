/**
 * Parses a VM's multus networkName into NAD namespace and name components.
 * The multus networkName format is "namespace/name" for cross-namespace NADs,
 * or just "name" for NADs in the same namespace as the VM.
 *
 * @param networkName - The multus networkName value from the VM spec
 * @param vmNamespace - Fallback namespace (the VM's namespace) when no namespace prefix is present
 * @returns Object with parsed `name` and `namespace`. Empty strings indicate a malformed value.
 */
export const parseVMMultusIntoNAD = (
  networkName: string,
  vmNamespace: string,
): { name: string; namespace: string } => {
  const slashIndex = networkName.indexOf('/');
  if (slashIndex === -1) {
    return { name: networkName, namespace: vmNamespace };
  }
  return {
    name: networkName.substring(slashIndex + 1),
    namespace: networkName.substring(0, slashIndex),
  };
};
