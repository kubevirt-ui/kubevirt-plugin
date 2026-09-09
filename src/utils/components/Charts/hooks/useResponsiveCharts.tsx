import { useCallback, useEffect, useRef, useState } from 'react';

import { getResizeObserver } from '@patternfly/react-core';

type UseResponsiveCharts = () => {
  height: number;
  ref: (node: Element) => void;
  width: number;
};
const useResponsiveCharts: UseResponsiveCharts = () => {
  const containerRef = useRef<Element | null>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>(200);
  const [listener, setListener] = useState<(() => void) | null>(null);
  const ref = useCallback((node: Element) => {
    if (node) {
      const sizeSetter = (): void => {
        setWidth(node.getBoundingClientRect().width);
        setHeight(node.getBoundingClientRect().height);
      };
      sizeSetter();
      setListener(getResizeObserver(containerRef.current ?? node, sizeSetter));
      containerRef.current = node;
    }
  }, []);

  useEffect(() => {
    return (): void => {
      listener?.();
    };
  }, [listener]);

  return { height, ref, width };
};

export default useResponsiveCharts;
