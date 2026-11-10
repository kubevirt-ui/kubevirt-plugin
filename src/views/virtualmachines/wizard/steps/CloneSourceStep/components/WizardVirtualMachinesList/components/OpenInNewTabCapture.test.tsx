import { fireEvent, render, screen } from '@testing-library/react';

import OpenInNewTabCapture from './OpenInNewTabCapture';

const HREF = 'https://console.example/k8s/ns/default/virtualmachines/test-vm';

describe('OpenInNewTabCapture', () => {
  const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  afterEach(() => {
    windowOpenSpy.mockClear();
  });

  afterAll(() => {
    windowOpenSpy.mockRestore();
  });

  it('should open the link in a new tab on primary click', () => {
    render(
      <OpenInNewTabCapture>
        <a href={HREF}>test-vm</a>
      </OpenInNewTabCapture>,
    );

    const event = fireEvent.click(screen.getByRole('link', { name: 'test-vm' }));

    expect(windowOpenSpy).toHaveBeenCalledWith(HREF, '_blank', 'noopener,noreferrer');
    expect(event).toBe(false);
  });

  it('should not intercept modifier-key clicks', () => {
    render(
      <OpenInNewTabCapture>
        <a href={HREF}>test-vm</a>
      </OpenInNewTabCapture>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { metaKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { shiftKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { altKey: true });

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('should not intercept clicks that are not on an anchor', () => {
    render(
      <OpenInNewTabCapture>
        <button type="button">Select</button>
      </OpenInNewTabCapture>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select' }));

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });
});
