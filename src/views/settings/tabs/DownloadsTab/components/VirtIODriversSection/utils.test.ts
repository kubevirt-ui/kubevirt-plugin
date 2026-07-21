import { getVersionFromImage } from './utils';

describe('getVersionFromImage', () => {
  it('should extract tag from a full registry image', () => {
    expect(
      getVersionFromImage(
        'registry.redhat.io/container-native-virtualization/virtio-win:v4.17.0-25',
      ),
    ).toBe('v4.17.0-25');
  });

  it('should extract tag from image with port in registry', () => {
    expect(getVersionFromImage('registry.example.com:5000/virtio-win:latest')).toBe('latest');
  });

  it('should extract digest from sha256 reference', () => {
    expect(getVersionFromImage('registry.redhat.io/virtio-win@sha256:abc123def456')).toBe(
      'sha256:abc123def456',
    );
  });

  it('should return undefined for image without tag or digest', () => {
    expect(
      getVersionFromImage('registry.redhat.io/container-native-virtualization/virtio-win'),
    ).toBeUndefined();
  });

  it('should return undefined for undefined input', () => {
    expect(getVersionFromImage(undefined)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(getVersionFromImage('')).toBeUndefined();
  });
});
