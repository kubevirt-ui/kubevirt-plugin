import { useCallback, useEffect, useRef, useState } from 'react';

import { getResizeObserver } from '@patternfly/react-core';

type UseResponsiveCharts = () => {
  height: number;
  ref: (node: Element) => void;
  width: number;
};
const useResponsiveCharts: UseResponsiveCharts = () => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>(200);
  const [listener, setListener] = useState(null);
  const ref = useCallback((node: Element) => {
    if (node) {
      const sizeSetter = () => {
        setWidth(node.getBoundingClientRect().width);
        setHeight(node.getBoundingClientRect().height);
      };
      sizeSetter();
      setListener(getResizeObserver(containerRef?.current, sizeSetter));
      containerRef.current = node;
    }
  }, []);

  useEffect(() => {
    return () => {
      listener && listener();
    };
  }, [listener]);

  return { height, ref, width };
};

export default useResponsiveCharts;
