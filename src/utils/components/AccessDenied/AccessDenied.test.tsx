import { render, screen } from '@testing-library/react';

import AccessDenied from './AccessDenied';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@images/restricted-sign.svg', () => 'restricted-sign.svg');

describe('AccessDenied', () => {
  it('should show Access Restricted soft copy for page layout', () => {
    render(<AccessDenied />);

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You do not have the required permissions to view this information. Please contact your OpenShift administrator if you need access.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Error details')).not.toBeInTheDocument();
  });

  it('should render inline warning for dashboard cards', () => {
    render(<AccessDenied inline />);

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You do not have the required permissions to view this information. Please contact your OpenShift administrator if you need access.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
