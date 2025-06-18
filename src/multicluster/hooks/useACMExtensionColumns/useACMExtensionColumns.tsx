import useIsACMPage from '@multicluster/useIsACMPage';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';

import {
  ACMVirtualMachineListColumnExtension,
  isACMVirtualMachineListColumnExtension,
} from './utils';

const useACMExtensionColumns = () => {
  const [acmVirtualMachineListColumExtension, acmVirtualMachineListColumExtensionResolved] =
    useResolvedExtensions<ACMVirtualMachineListColumnExtension>(
      isACMVirtualMachineListColumnExtension,
    );
  const isACMPage = useIsACMPage();

  if (!isACMPage) return [];

  return acmVirtualMachineListColumExtensionResolved
    ? acmVirtualMachineListColumExtension.map((extension) => extension.properties)
    : [];
};

export default useACMExtensionColumns;
