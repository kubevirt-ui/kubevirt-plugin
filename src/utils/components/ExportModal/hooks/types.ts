export enum UploaderPhase {
  Done = 'done',
  Downloading = 'downloading',
  Error = 'error',
  Idle = 'idle',
  Uploading = 'uploading',
}

export type UploaderProgress = {
  bytesUploaded: number;
  errorMessage?: string;
  percentage: number;
  phase: UploaderPhase;
  speedMbps: number;
  timeRemaining: string;
  totalBytes: number;
};

export type DiskUploaderLogEntry = {
  bytes_uploaded?: number;
  error?: string;
  level?: string;
  msg?: string;
  percentage?: number;
  speed_mbps?: number;
  time_remaining?: string;
  total_bytes?: number;
};
