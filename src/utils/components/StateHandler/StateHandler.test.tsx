import { render, screen } from '@testing-library/react';

import StateHandler from './StateHandler';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@images/restricted-sign.svg', () => 'restricted-sign.svg');

describe('StateHandler', () => {
  it('should show AccessDenied for Forbidden errors', () => {
    render(
      <StateHandler
        error={{ message: 'Forbidden: cannot list plans', status: 403 }}
        hasData={false}
        loaded
      >
        <div>content</div>
      </StateHandler>,
    );

    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('should show danger Alert for non-authz errors', () => {
    render(
      <StateHandler error={{ message: 'boom', response: { status: 500 } }} hasData={false} loaded>
        <div>content</div>
      </StateHandler>,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
