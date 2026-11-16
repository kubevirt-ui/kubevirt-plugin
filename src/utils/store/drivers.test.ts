import { getDriverEntry, setDriverEntry, subscribeDriverCache } from './drivers';

describe('drivers cache store', () => {
  it('notifies subscribers when an entry is set', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDriverCache(listener);

    setDriverEntry('test-cluster', {
      downloadURL: 'https://example.com/virtio-win',
      image: 'registry.example.com/virtio-win:latest',
      loading: false,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getDriverEntry('test-cluster')).toEqual({
      downloadURL: 'https://example.com/virtio-win',
      image: 'registry.example.com/virtio-win:latest',
      loading: false,
    });

    unsubscribe();
    setDriverEntry('test-cluster', {
      downloadURL: 'https://example.com/virtio-win',
      image: 'registry.example.com/virtio-win:v2',
      loading: false,
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
