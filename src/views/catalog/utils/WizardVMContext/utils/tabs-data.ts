import { RegistryCredentials } from '@catalog/utils/useRegistryCredentials/utils/types';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

export type TabsData = {
  additionalObjects?: any[];
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
  sshDetails?: SSHSecretDetails;
  subscriptionData?: RHELAutomaticSubscriptionData;
};
