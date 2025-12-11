import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
  ROW_FILTERS_PREFIX,
} from '@kubevirt-utils/utils/constants';

export const OBJECTS_FETCHING_LIMIT = 10000;

export const booleanTextIds = {
  no: 'no',
  yes: 'yes',
};

export enum VirtualMachineRowFilterType {
  Architecture = 'architecture',
  Cluster = CLUSTER_LIST_FILTER_TYPE,
  CPU = 'cpu',
  DateCreatedFrom = 'dateCreatedFrom',
  DateCreatedTo = 'dateCreatedTo',
  Description = 'description',
  HWDevices = 'hwDevices',
  IP = 'ip',
  Labels = 'labels',
  Memory = 'memory',
  NAD = 'nad',
  Name = 'name',
  Node = 'node',
  OS = 'os',
  Project = PROJECT_LIST_FILTER_TYPE,
  Scheduling = 'scheduling',
  Status = 'status',
  StorageClass = 'storageClass',
}

export const STATUS_LIST_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${VirtualMachineRowFilterType.Status}`;
