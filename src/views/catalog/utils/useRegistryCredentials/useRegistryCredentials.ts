import { RegistryCredentials } from '@catalog/utils/useRegistryCredentials/utils/types';
import { getDecodedRegistryCredentials } from '@catalog/utils/useRegistryCredentials/utils/utils';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { encodeSecretKey } from '@kubevirt-utils/resources/secret/utils';

type UseRegistryCredentials = () => {
  decodedRegistryCredentials: RegistryCredentials;
  updateRegistryCredentials: (decodedCredentials: RegistryCredentials) => void;
};

const useRegistryCredentials: UseRegistryCredentials = () => {
  const { tabsData, updateTabsData } = useWizardVMContext();
  const encodedRegistryCredentials = tabsData?.disks?.rootDiskRegistryCredentials;
  const decodedRegistryCredentials = getDecodedRegistryCredentials(
    encodedRegistryCredentials,
  ) as RegistryCredentials;

  const updateRegistryCredentials = (decodedCredentials: RegistryCredentials) =>
    updateTabsData((currentTabsData) => {
      const { password, username } = decodedCredentials;
      currentTabsData.disks.rootDiskRegistryCredentials = {
        password: encodeSecretKey(password),
        username: encodeSecretKey(username),
      };
    });

  return {
    decodedRegistryCredentials,
    updateRegistryCredentials,
  };
};

export default useRegistryCredentials;
