export type SelfValidationJobOptions = {
  acceptWindowsEula?: boolean;
  checkupImage: string;
  createResultsResources?: boolean;
  isDryRun: boolean;
  jobNameOverride?: string;
  name: string;
  namespace: string;
  pvcName?: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  timestamp?: string;
  winImageDownloadUrl?: string;
};
