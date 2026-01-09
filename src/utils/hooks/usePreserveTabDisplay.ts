import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom-v5-compat';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';

type UsePreserveTabDisplayProps = {
  basePath: string;
  storageKey: string;
};

const usePreserveTabDisplay = ({ basePath, storageKey }: UsePreserveTabDisplayProps) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const currentNsRef = useRef(namespace);
  const currentTabRef = useRef<string>('');
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (runningTourSignal.value) return;

    const extractPathSegmentRegex = new RegExp(`${basePath}/(.+)`);
    const match = location.pathname.match(extractPathSegmentRegex);
    const currentTab = match?.[1] || '';

    const namespaceChanged = currentNsRef.current !== namespace;
    const prevTab = currentTabRef.current;

    currentNsRef.current = namespace;
    currentTabRef.current = currentTab;

    if (currentTab) {
      sessionStorage.setItem(storageKey, currentTab);
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!namespaceChanged || currentTab || !prevTab) return;

    const storedTab = sessionStorage.getItem(storageKey);
    if (!storedTab) return;

    const newPath = namespace
      ? `/k8s/ns/${namespace}/${basePath}/${storedTab}`
      : `/k8s/all-namespaces/${basePath}/${storedTab}`;
    navigate(newPath, { replace: true });
  }, [namespace, location.pathname, basePath, storageKey, navigate]);
};

export default usePreserveTabDisplay;
