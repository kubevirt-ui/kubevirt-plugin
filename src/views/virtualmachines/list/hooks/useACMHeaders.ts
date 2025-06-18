import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import useACMExtensionColumns from './useACMExtensionColumns/useACMExtensionColumns';

const useACMHeaders = (): TableColumn<K8sResourceCommon>[] => {
  const columnsProperties = useACMExtensionColumns();

  return columnsProperties.map((column) => ({
    id: column.header,
    title: column.header,
  }));
};

export default useACMHeaders;
