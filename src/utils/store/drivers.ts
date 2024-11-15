import { DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { signal } from '@preact/signals-core';

export const driverImage = signal(DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE);

export const loadingDriver = signal(true);
