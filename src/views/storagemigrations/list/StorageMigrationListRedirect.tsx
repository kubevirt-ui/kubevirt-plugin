import { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';

const ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST = '/k8s/all-namespaces/storagemigrations';

const StorageMigrationListRedirect: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const namespace = useNamespaceParam();

  useEffect(() => {
    const isAllNamespaces = location.pathname.includes('/k8s/all-namespaces/');
    const pathname = isAllNamespaces
      ? ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST
      : `/k8s/ns/${namespace}/storagemigrations`;

    navigate(`${pathname}${location.search}${location.hash}`, { replace: true });
  }, [location.hash, location.pathname, location.search, namespace, navigate]);

  return null;
};

export default StorageMigrationListRedirect;
