import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

export type TabsData = {
  additionalObjects?: any[];
  overview?: {
    templateMetadata?: {
      name?: string;
      namespace?: string;
      displayName?: string;
      osType?: OS_NAME_TYPES;
    };
  };
  disks?: {
    dataVolumesToAddOwnerRef?: V1beta1DataVolume[];
  };
  scripts?: {
    cloudInit: {
      sshKey?: string;
    };
  };
};
