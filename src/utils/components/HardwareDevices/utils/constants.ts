export enum HARDWARE_DEVICE_TYPE {
  GPUS = 'gpus',
  HOST_DEVICES = 'hostDevices',
}

export type HardwareDeviceModalRow = {
  name: string;
  deviceName: string;
  deviceIndex: number;
};
