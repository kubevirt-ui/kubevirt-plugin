import * as React from 'react';

import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { cleanup, render, screen } from '@testing-library/react';

import CustomizeVirtualMachine from '../CustomizeVirtualMachine';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
  useHistory: () => ({ push: jest.fn() }),
}));

jest.mock('@kubevirt-utils/hooks/useURLParams', () => ({
  useURLParams: () => ({
    params: {
      namespace: 'mock-namespace',
      name: 'mock-name',
      get: function (parameter) {
        return this[parameter];
      },
    },
  }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getMockTemplate: getTemplate } = require('./mocks');
  return {
    useK8sWatchResource: jest.fn().mockReturnValue([getTemplate(), true, undefined]),
  };
});

const mockVirtualMachineTemplate = getMockTemplate();

describe('Test CustomizeVirtualMachine', () => {
  beforeEach(() => {
    cleanup();
  });

  it('It render the form on template loaded', () => {
    render(<CustomizeVirtualMachine />);

    const nParameters = mockVirtualMachineTemplate.parameters.length;

    expect(screen.getAllByRole('textbox')).toHaveLength(nParameters);
  });

  it('It render the loading properly on loading', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([undefined, false, undefined]);
    render(<CustomizeVirtualMachine />);

    screen.getByTestId('scheleton');
  });

  it('It render the error properly on loading error', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([
      undefined,
      true,
      new Error('some strange error'),
    ]);

    render(<CustomizeVirtualMachine />);
    expect(screen.queryByTestId('scheleton')).toBeNull();
    screen.getByTestId('error-message');
  });
});
