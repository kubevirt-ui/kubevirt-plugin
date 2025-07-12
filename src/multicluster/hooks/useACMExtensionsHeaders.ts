import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import useACMExtensionColumns from './useACMExtensionColumns/useACMExtensionColumns';

const useACMExtensionsHeaders = (): TableColumn<K8sResourceCommon>[] => {
  const columnsProperties = useACMExtensionColumns();

  return columnsProperties.map(({ header }) => ({
    id: header,
    title: header,
  }));
};

export default useACMExtensionsHeaders;
