import { type DiskUploaderLogEntry, UploaderPhase, type UploaderProgress } from './types';

const DOWNLOADING_MSG = 'Downloading disk image';
const UPLOADING_MSG = 'Uploading image';

const extractErrorDetails = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;

  const jsonMatch = raw.match(/\{[^}]*"details"\s*:\s*"([^"]+)"[^}]*\}/);
  if (jsonMatch?.[1]) return jsonMatch[1];

  return raw;
};

export const parseLogEntry = (line: string): DiskUploaderLogEntry | null => {
  try {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) return null;
    return JSON.parse(trimmed) as DiskUploaderLogEntry;
  } catch {
    return null;
  }
};

export const reduceProgress = (
  current: UploaderProgress,
  entry: DiskUploaderLogEntry,
): UploaderProgress => {
  if (current.phase === UploaderPhase.Error) {
    return current;
  }

  if (entry.level === 'error') {
    return {
      ...current,
      errorMessage: extractErrorDetails(entry.error ?? entry.msg),
      phase: UploaderPhase.Error,
    };
  }

  if (entry.msg === DOWNLOADING_MSG && typeof entry.percentage === 'number') {
    return {
      ...current,
      percentage: entry.percentage,
      phase: UploaderPhase.Downloading,
    };
  }

  if (entry.msg === UPLOADING_MSG && typeof entry.percentage === 'number') {
    return {
      bytesUploaded: entry.bytes_uploaded ?? current.bytesUploaded,
      percentage: entry.percentage,
      phase: UploaderPhase.Uploading,
      speedMbps: entry.speed_mbps ?? current.speedMbps,
      timeRemaining: entry.time_remaining ?? current.timeRemaining,
      totalBytes: entry.total_bytes ?? current.totalBytes,
    };
  }

  return current;
};

export const initialProgress: UploaderProgress = {
  bytesUploaded: 0,
  percentage: 0,
  phase: UploaderPhase.Idle,
  speedMbps: 0,
  timeRemaining: '',
  totalBytes: 0,
};
