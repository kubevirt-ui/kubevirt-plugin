import { useWatch } from 'react-hook-form';

import { Table, Tbody } from '@patternfly/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import OpenInNewTabCapture from './OpenInNewTabCapture';
import VirtualMachineRow from './VirtualMachineRow';

jest.mock('react-hook-form', () => ({
  useWatch: jest.fn(),
}));

jest.mock('@virtualmachines/wizard/form/VMWizardFormProvider', () => ({
  useVMWizardForm: jest.fn(),
}));

const HREF = 'https://console.example/k8s/ns/default/virtualmachines/test-vm';

const mockVm = {
  metadata: { name: 'test-vm', namespace: 'default', uid: 'uid-1' },
} as Parameters<typeof VirtualMachineRow>[0]['vm'];

const columns = [
  {
    key: 'name',
    renderCell: () => (
      <OpenInNewTabCapture>
        <a href={HREF}>test-vm</a>
      </OpenInNewTabCapture>
    ),
  },
  {
    key: 'created',
    renderCell: () => <span>non-interactive</span>,
  },
];

describe('VirtualMachineRow', () => {
  const setValue = jest.fn();
  const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  beforeEach(() => {
    jest.clearAllMocks();
    (useVMWizardForm as jest.Mock).mockReturnValue({ control: {}, setValue });
    (useWatch as jest.Mock).mockReturnValue(undefined);
  });

  afterAll(() => {
    windowOpenSpy.mockRestore();
  });

  const renderRow = () =>
    render(
      <Table>
        <Tbody>
          <VirtualMachineRow callbacks={{} as never} columns={columns as never} vm={mockVm} />
        </Tbody>
      </Table>,
    );

  it('should open the link in a new tab without selecting the row', () => {
    renderRow();

    fireEvent.click(screen.getByRole('link', { name: 'test-vm' }));

    expect(windowOpenSpy).toHaveBeenCalledWith(HREF, '_blank', 'noopener,noreferrer');
    expect(setValue).not.toHaveBeenCalled();
  });

  it('should select the source VM when clicking a non-interactive cell', () => {
    renderRow();

    fireEvent.click(screen.getByText('non-interactive'));

    expect(setValue).toHaveBeenCalledWith(
      'clone.sourceVM',
      mockVm,
      expect.objectContaining({ shouldDirty: true }),
    );
  });
});
