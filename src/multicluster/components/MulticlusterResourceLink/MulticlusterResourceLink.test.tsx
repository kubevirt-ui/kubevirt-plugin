import type { FC, ReactNode } from 'react';

import { OpenLinksInNewTabContext } from '@kubevirt-utils/components/OpenLinksInNewTabContext/OpenLinksInNewTabContext';
import { fireEvent, render, screen } from '@testing-library/react';

import MulticlusterResourceLink from './MulticlusterResourceLink';

const HREF = 'https://console.example/k8s/ns/default/virtualmachines/test-vm';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  ResourceLink: ({ name }: { name?: string }) => <a href={HREF}>{name}</a>,
}));

jest.mock('@stolostron/multicluster-sdk', () => ({
  FleetResourceLink: ({ name }: { name?: string }) => <a href={HREF}>{name}</a>,
}));

const Wrapper: FC<{ children: ReactNode; openInNewTab?: boolean }> = ({
  children,
  openInNewTab = false,
}) => (
  <OpenLinksInNewTabContext.Provider value={openInNewTab}>
    {children}
  </OpenLinksInNewTabContext.Provider>
);

describe('MulticlusterResourceLink', () => {
  const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  afterEach(() => {
    windowOpenSpy.mockClear();
  });

  afterAll(() => {
    windowOpenSpy.mockRestore();
  });

  it('should open the link in a new tab on primary click when context is enabled', () => {
    render(
      <Wrapper openInNewTab>
        <MulticlusterResourceLink
          groupVersionKind={{ group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' }}
          name="test-vm"
          namespace="default"
        />
      </Wrapper>,
    );

    const link = screen.getByRole('link', { name: 'test-vm' });
    const event = fireEvent.click(link);

    expect(windowOpenSpy).toHaveBeenCalledWith(HREF, '_blank', 'noopener,noreferrer');
    expect(event).toBe(false);
  });

  it('should not intercept modifier-key clicks when context is enabled', () => {
    render(
      <Wrapper openInNewTab>
        <MulticlusterResourceLink
          groupVersionKind={{ group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' }}
          name="test-vm"
          namespace="default"
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { metaKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { shiftKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }), { altKey: true });

    expect(windowOpenSpy).not.toHaveBeenCalled();
  });

  it('should follow normal link behavior when context is disabled', () => {
    render(
      <Wrapper>
        <MulticlusterResourceLink
          groupVersionKind={{ group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' }}
          name="test-vm"
          namespace="default"
        />
      </Wrapper>,
    );

    const event = fireEvent.click(screen.getByRole('link', { name: 'test-vm' }));

    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(event).toBe(true);
  });
});
