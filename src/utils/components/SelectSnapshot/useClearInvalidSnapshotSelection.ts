import { useEffect } from 'react';

type ProjectSnapshotCount = {
  count: number;
  name: string;
};

type UseClearInvalidSnapshotSelectionArgs = {
  projectsLoaded: boolean;
  projectsWithSnapshots: ProjectSnapshotCount[];
  selectSnapshotName: (value: string) => void;
  selectSnapshotNamespace?: (value: string) => void;
  snapshotNames: string[];
  snapshotNameSelected: string;
  snapshotNamespaceSelected: string;
  snapshotsLoaded: boolean;
};

const useClearInvalidSnapshotSelection = ({
  projectsLoaded,
  projectsWithSnapshots,
  selectSnapshotName,
  selectSnapshotNamespace,
  snapshotNames,
  snapshotNameSelected,
  snapshotNamespaceSelected,
  snapshotsLoaded,
}: UseClearInvalidSnapshotSelectionArgs): void => {
  useEffect(() => {
    if (snapshotNameSelected && snapshotsLoaded && !snapshotNames.includes(snapshotNameSelected)) {
      selectSnapshotName(undefined);
    }
  }, [selectSnapshotName, snapshotNameSelected, snapshotNames, snapshotsLoaded]);

  useEffect(() => {
    if (
      !snapshotNamespaceSelected ||
      !projectsLoaded ||
      projectsWithSnapshots.some(({ name }) => name === snapshotNamespaceSelected)
    ) {
      return;
    }
    selectSnapshotNamespace?.(undefined);
    selectSnapshotName(undefined);
  }, [
    projectsLoaded,
    projectsWithSnapshots,
    selectSnapshotName,
    selectSnapshotNamespace,
    snapshotNamespaceSelected,
  ]);
};

export default useClearInvalidSnapshotSelection;
