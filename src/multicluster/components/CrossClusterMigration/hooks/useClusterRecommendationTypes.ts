export type VMVolumeInfo = {
  name: string;
  sizeBytes: number;
  storageClass: string;
};

export type SourceVMInfo = {
  cluster: string;
  cpuCores: number;
  memoryBytes: number;
  name: string;
  namespace: string;
  volumes: VMVolumeInfo[];
};

export type CandidateCluster = {
  availableCPUCores: number;
  availableMemoryBytes: number;
  bestNode: string;
  cluster: string;
  cpuScore: number;
  matchedStorageClasses: string[];
  memoryScore: number;
  storageScore: number;
  storageType: string;
  totalScore: number;
};

export type Recommendation = {
  availableCPUCores: number;
  availableMemoryBytes: number;
  cluster: string;
  node: string;
  storageType: string;
  totalScore: number;
};

export type ExcludedCluster = {
  cluster: string;
  reasons: string[];
};

export type MigrationTargetResponse = {
  candidates: CandidateCluster[];
  excludedClusters: ExcludedCluster[];
  recommendation: Recommendation;
  sourceVM: SourceVMInfo;
};
