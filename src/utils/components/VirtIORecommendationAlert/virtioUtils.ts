import { type TFunction } from 'i18next';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { interfaceModelType } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/constants';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export type VirtIORecommendationKind = 'disk' | 'network';

type VirtIORecommendation = {
  description: string;
  shouldShow: boolean;
  switchToVirtio: (vm: V1VirtualMachine) => V1VirtualMachine;
  title: string;
};

export const getVirtIORecommendations = (
  t: TFunction,
  vm: V1VirtualMachine,
): Record<VirtIORecommendationKind, VirtIORecommendation> => ({
  disk: {
    description: t(
      'VirtIO provides the best performance. Switch disk interfaces to VirtIO unless guest drivers are unavailable.',
    ),
    shouldShow: hasNonVirtioDisk(vm),
    switchToVirtio: switchDisksToVirtio,
    title: t('Non-VirtIO disk interfaces detected'),
  },
  network: {
    description: t(
      'VirtIO provides the best performance. Switch network interfaces to VirtIO unless guest drivers are unavailable.',
    ),
    shouldShow: hasNonVirtioInterface(vm),
    switchToVirtio: switchInterfacesToVirtio,
    title: t('Non-VirtIO network interfaces detected'),
  },
});

export const hasNonVirtioDisk = (vm: V1VirtualMachine): boolean =>
  (getDisks(vm) ?? []).some((disk) => disk?.disk?.bus && disk.disk.bus !== InterfaceTypes.VIRTIO);

export const hasNonVirtioInterface = (vm: V1VirtualMachine): boolean =>
  (getInterfaces(vm) ?? []).some(
    (iface) => iface?.model && iface.model !== interfaceModelType.VIRTIO,
  );

export const switchDisksToVirtio = (vm: V1VirtualMachine): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, 'spec.template.spec.domain.devices');
    draft.spec.template.spec.domain.devices.disks = (getDisks(vm) ?? []).map((disk) =>
      disk?.disk && disk.disk.bus !== InterfaceTypes.VIRTIO
        ? { ...disk, disk: { ...disk.disk, bus: InterfaceTypes.VIRTIO } }
        : disk,
    );
  });

export const switchInterfacesToVirtio = (vm: V1VirtualMachine): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, 'spec.template.spec.domain.devices');
    draft.spec.template.spec.domain.devices.interfaces = (getInterfaces(vm) ?? []).map((iface) =>
      iface?.model && iface.model !== interfaceModelType.VIRTIO
        ? { ...iface, model: interfaceModelType.VIRTIO }
        : iface,
    );
  });
