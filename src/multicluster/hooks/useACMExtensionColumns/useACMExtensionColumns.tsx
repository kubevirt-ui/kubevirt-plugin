import {
  ACMVirtualMachineListColumn,
  isACMVirtualMachineListColumn,
} from '@kubevirt-extensions/acm.virtualmachine';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';

const useACMExtensionColumns = () => {
  const [virtualMachineListColumnExtensions, virtualMachineListColumnExtensionsResolved] =
    useResolvedExtensions<ACMVirtualMachineListColumn>(isACMVirtualMachineListColumn);

  const isACMPage = useIsACMPage();

  if (!isACMPage) return [];

  return virtualMachineListColumnExtensionsResolved
    ? virtualMachineListColumnExtensions.map((extension) => extension.properties)
    : [];
};

export default useACMExtensionColumns;
