export enum HARDWARE_DEVICE_TYPE {
  GPUS = 'gpus',
  HOST_DEVICES = 'hostDevices',
}

export type HardwareDeviceModalRow = {
  deviceIndex: number;
  deviceName: string;
  name: string;
};
