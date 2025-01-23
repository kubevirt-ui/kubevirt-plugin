import { RegistryCredentials } from '@catalog/utils/useRegistryCredentials/utils/types';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

export type TabsData = {
  additionalObjects?: any[];
  applySSHToSettings?: boolean;
  authorizedSSHKey?: string;
  disks?: {
    dataVolumesToAddOwnerRef?: V1beta1DataVolume[];
    rootDiskRegistryCredentials?: RegistryCredentials;
  };
  overview?: {
    templateMetadata?: {
      displayName?: string;
      name?: string;
      namespace?: string;
      osType?: OS_NAME_TYPES;
    };
  };
  subscriptionData?: RHELAutomaticSubscriptionData;
};
