import { type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { isContainerDiskVolume, parseDiagnosticReason } from './utils';

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

describe('parseDiagnosticReason', () => {
  it('splits a reason and message at the first colon', () => {
    expect(
      parseDiagnosticReason('NotSupported:Container disks cannot be snapshotted', 'disk'),
    ).toEqual({
      message: 'Container disks cannot be snapshotted',
      name: 'NotSupported',
      reason: 'NotSupported',
    });
  });

  it('uses an unsplit reason as the message and metadata name', () => {
    expect(parseDiagnosticReason('NotSupported', 'disk')).toEqual({
      message: 'NotSupported',
      name: 'NotSupported',
      reason: 'disk',
    });
  });

  it('uses the fallback name when the reason is missing', () => {
    expect(parseDiagnosticReason(undefined, 'disk')).toEqual({
      message: undefined,
      name: 'disk',
      reason: 'disk',
    });
  });
});
