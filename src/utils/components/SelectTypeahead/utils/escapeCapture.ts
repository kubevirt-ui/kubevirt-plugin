export const addEscapeCaptureListener = (onEscape: () => void): (() => void) => {
  const handleEscapeCapture = (event: globalThis.KeyboardEvent): void => {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    onEscape();
  };

  document.addEventListener('keydown', handleEscapeCapture, true);

  return (): void => {
    document.removeEventListener('keydown', handleEscapeCapture, true);
  };
};
