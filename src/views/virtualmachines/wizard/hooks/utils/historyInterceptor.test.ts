import {
  createHistoryStateInterceptor,
  getIntendedPathFromHistoryUrl,
  restoreHistoryMethodIfOwned,
} from './historyInterceptor';

describe('getIntendedPathFromHistoryUrl', () => {
  it('should resolve an empty url to the current location', () => {
    window.history.pushState({}, '', '/vm-wizard?step=1#disks');

    expect(getIntendedPathFromHistoryUrl('')).toBe('/vm-wizard?step=1#disks');
    expect(getIntendedPathFromHistoryUrl(undefined)).toBe('/vm-wizard?step=1#disks');
  });

  it('should parse absolute urls down to path, search, and hash', () => {
    expect(
      getIntendedPathFromHistoryUrl('https://console.example/k8s/ns/ns/virtualmachines?q=1#x'),
    ).toBe('/k8s/ns/ns/virtualmachines?q=1#x');
  });

  it('should resolve relative urls against the current location', () => {
    window.history.pushState({}, '', '/vm-wizard');

    expect(getIntendedPathFromHistoryUrl('/k8s/ns/ns/virtualmachines')).toBe(
      '/k8s/ns/ns/virtualmachines',
    );
  });
});

describe('createHistoryStateInterceptor', () => {
  const originalPushState = window.history.pushState;

  afterEach(() => {
    window.history.pushState = originalPushState;
  });

  it('should apply the original write when allowed', () => {
    const original = jest.fn();
    const onBlock = jest.fn();
    const intercept = createHistoryStateInterceptor(original, () => true, onBlock);

    intercept({}, '', '/vm-wizard');

    expect(original).toHaveBeenCalledTimes(1);
    expect(onBlock).not.toHaveBeenCalled();
  });

  it('should block the write and report the intended path', () => {
    const original = jest.fn();
    const onBlock = jest.fn();
    const intercept = createHistoryStateInterceptor(original, () => false, onBlock);

    intercept({}, '', '/k8s/ns/ns/virtualmachines');

    expect(original).not.toHaveBeenCalled();
    expect(onBlock).toHaveBeenCalledWith('/k8s/ns/ns/virtualmachines');
  });
});

describe('restoreHistoryMethodIfOwned', () => {
  const originalPushState = window.history.pushState;

  afterEach(() => {
    window.history.pushState = originalPushState;
  });

  it('should restore the original method when this intercept still owns the slot', () => {
    const intercept: History['pushState'] = jest.fn();
    window.history.pushState = intercept;

    restoreHistoryMethodIfOwned('pushState', intercept, originalPushState);

    expect(window.history.pushState).toBe(originalPushState);
  });

  it('should not clobber a later wrapper that replaced this intercept', () => {
    const intercept: History['pushState'] = jest.fn();
    const laterWrapper: History['pushState'] = jest.fn();
    window.history.pushState = laterWrapper;

    restoreHistoryMethodIfOwned('pushState', intercept, originalPushState);

    expect(window.history.pushState).toBe(laterWrapper);
  });
});
