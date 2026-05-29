import {
  isProbeTransportOrLikelyUnknownError,
  isStorageMigrationResourceNotFound,
} from './probeHttpUtils';

export type StorageMigrationProbeListErrorActions = {
  canceled: () => boolean;
  onCrdPresentButListDenied: () => void;
  onNotFound: () => void;
  onTransport: () => void;
};

/**
 * Shared LIST probe `.catch` handling: 404 → not installed, transport-like errors → treat as absent,
 * other HTTP (e.g. 403) → CRD present but LIST denied (caller may still CREATE).
 */
export const handleStorageMigrationProbeListError = (
  error: unknown,
  {
    canceled,
    onCrdPresentButListDenied,
    onNotFound,
    onTransport,
  }: StorageMigrationProbeListErrorActions,
): void => {
  if (canceled()) return;
  if (isStorageMigrationResourceNotFound(error)) {
    onNotFound();
    return;
  }
  if (isProbeTransportOrLikelyUnknownError(error)) {
    onTransport();
    return;
  }
  onCrdPresentButListDenied();
};
