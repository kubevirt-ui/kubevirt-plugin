import { render, screen } from '@testing-library/react';

import ErrorAlert from './ErrorAlert';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ErrorAlert', () => {
  it('should show danger An error occurred for failures', () => {
    const { container } = render(<ErrorAlert error={{ message: 'network timeout' }} />);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('network timeout')).toBeInTheDocument();
    expect(container.querySelector('.pf-m-danger')).toBeTruthy();
  });

  it('should not special-case Forbidden as Access Restricted', () => {
    render(
      <ErrorAlert
        error={{
          message:
            'subscriptions.operators.coreos.com is forbidden: User "GK0X" cannot list resource "subscriptions"',
        }}
      />,
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument();
  });
});
