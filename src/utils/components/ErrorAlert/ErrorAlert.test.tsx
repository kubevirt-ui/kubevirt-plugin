import { render, screen } from '@testing-library/react';

import ErrorAlert from './ErrorAlert';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ErrorAlert', () => {
  it('should show Access Restricted warning for Forbidden message errors', () => {
    const { container } = render(
      <ErrorAlert
        error={{
          message:
            'subscriptions.operators.coreos.com is forbidden: User "GK0X" cannot list resource "subscriptions"',
        }}
      />,
    );

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You do not have the required permissions to view this information. Please contact your OpenShift administrator if you need access.',
      ),
    ).toBeInTheDocument();
    expect(container.querySelector('.pf-m-warning')).toBeTruthy();
  });

  it('should show Access Restricted warning for HTTP 403 status errors', () => {
    const { container } = render(
      <ErrorAlert
        error={{ message: 'access denied', status: 403 } as { message: string }}
      />,
    );

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(container.querySelector('.pf-m-warning')).toBeTruthy();
  });

  it('should keep danger An error occurred for non-authz failures', () => {
    const { container } = render(<ErrorAlert error={{ message: 'network timeout' }} />);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('network timeout')).toBeInTheDocument();
    expect(container.querySelector('.pf-m-danger')).toBeTruthy();
  });
});
