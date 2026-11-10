import type { FC, MouseEvent, ReactNode } from 'react';

type OpenInNewTabCaptureProps = {
  children: ReactNode;
};

const handleClickCapture = (event: MouseEvent): void => {
  // Allow non-primary clicks (middle click, right click) and modified keys through
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const anchor = (event.target as HTMLElement).closest('a');
  if (!anchor?.href) {
    return;
  }

  // Prevent internal React Router navigation, but let event bubble for analytics/parents
  event.preventDefault();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
};

const OpenInNewTabCapture: FC<OpenInNewTabCaptureProps> = ({ children }) => (
  <span onClickCapture={handleClickCapture} style={{ display: 'contents' }}>
    {children}
  </span>
);

export default OpenInNewTabCapture;
