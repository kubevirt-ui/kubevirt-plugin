import {
  type CLOUD_IDENTITY_PROVIDERS,
  type CLOUD_IDENTITY_SERVICE_ACCOUNT_SOURCES,
} from '../constants/constants';

export type CloudIdentityProvider = (typeof CLOUD_IDENTITY_PROVIDERS)[number];
export type CloudIdentityServiceAccountSource =
  (typeof CLOUD_IDENTITY_SERVICE_ACCOUNT_SOURCES)[number];

export type CloudIdentityFormValues = {
  awsRoleArn: string;
  existingServiceAccountName: string;
  newServiceAccountName: string;
  serviceAccountSource: CloudIdentityServiceAccountSource;
};
