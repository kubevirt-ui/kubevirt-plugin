import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  type OnSelectBootableVolume,
  type UseBootableVolumesValues,
  type UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/wizard/utils/types';

export type ChangeBootSourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

export type ChangeBootSourcePreferenceData = {
  lockedPreference?: PreferenceOption;
  preferenceName?: string;
};

export type UseChangeBootSourceModalValues = ChangeBootSourcePreferenceData & {
  bootableVolumesData: UseBootableVolumesValues;
  canCreate: boolean;
  cluster: string;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
  onConfirm: () => void;
  onCreateVolume: (volume: BootableVolume) => void;
  onSelectBootableVolume: OnSelectBootableVolume;
  selectedBootableVolume?: BootableVolume;
  setVolumeListNamespace: (namespace: string) => void;
  volumeListNamespace: string;
};
