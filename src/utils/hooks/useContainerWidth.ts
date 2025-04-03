import { MutableRefObject, useEffect, useState } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';

const useContainerWidth = (containerRef: MutableRefObject<HTMLElement>) => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const updateWidth = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    };

    const resizeObserver = new ResizeObserver(debounce(updateWidth));

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  return containerWidth;
};

export default useContainerWidth;
