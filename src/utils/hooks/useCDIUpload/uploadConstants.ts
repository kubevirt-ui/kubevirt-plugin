export class PVCInitError extends Error {
  constructor() {
    super('DataVolume failed to initiate upload.');
  }
}

export const delay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));
