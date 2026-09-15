import { type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { isContainerDiskVolume } from './utils';

describe('isContainerDiskVolume', () => {
  const volumes: V1Volume[] = [
    { containerDisk: { image: 'registry.example/container-disk' }, name: 'container-disk' },
    { ephemeral: { persistentVolumeClaim: { claimName: 'source-pvc' } }, name: 'ephemeral' },
    { name: 'persistent', persistentVolumeClaim: { claimName: 'persistent-pvc' } },
  ];

  it('identifies a container disk by volume name', () => {
    expect(isContainerDiskVolume('container-disk', volumes)).toBe(true);
  });

  it('does not treat the distinct ephemeral API source as a container disk', () => {
    expect(isContainerDiskVolume('ephemeral', volumes)).toBe(false);
  });

  it('does not identify an unrelated volume as a container disk', () => {
    expect(isContainerDiskVolume('persistent', volumes)).toBe(false);
  });
});
