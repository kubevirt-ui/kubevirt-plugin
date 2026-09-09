import { type MutableRefObject, useEffect, useState } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';

const useContainerWidth = (containerRef: MutableRefObject<HTMLElement>): number => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateWidth = (entries: ResizeObserverEntry[]): void => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    };

    const resizeObserver = new ResizeObserver(debounce(updateWidth, 50));

    resizeObserver.observe(container);

    return (): void => resizeObserver.disconnect();
  }, [containerRef]);

  return containerWidth;
};

export default useContainerWidth;
