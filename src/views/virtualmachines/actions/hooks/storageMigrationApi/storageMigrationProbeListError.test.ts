import { handleStorageMigrationProbeListError } from './storageMigrationProbeListError';

describe('handleStorageMigrationProbeListError', () => {
  it('invokes onNotFound when canceled is false and error is 404-shaped', () => {
    const onNotFound = jest.fn();
    handleStorageMigrationProbeListError(
      { response: { status: 404 } },
      {
        canceled: () => false,
        onCrdPresentButListDenied: jest.fn(),
        onNotFound,
        onTransport: jest.fn(),
      },
    );
    expect(onNotFound).toHaveBeenCalledTimes(1);
  });

  it('does nothing when canceled', () => {
    const onNotFound = jest.fn();
    handleStorageMigrationProbeListError(
      { response: { status: 404 } },
      {
        canceled: () => true,
        onCrdPresentButListDenied: jest.fn(),
        onNotFound,
        onTransport: jest.fn(),
      },
    );
    expect(onNotFound).not.toHaveBeenCalled();
  });
});
