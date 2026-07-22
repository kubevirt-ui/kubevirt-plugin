/**
 * IBM Cloud authentication and service client factory.
 * Uses ibm-cloud-sdk-core for IAM authentication.
 *
 * Service-specific SDKs (@ibm-cloud/vpc, @ibm-cloud/container-services,
 * @ibm-cloud/cis) are added when their scripts are migrated (Phase 1b).
 */

import { IamAuthenticator, IamTokenManager } from 'ibm-cloud-sdk-core';

import { requireEnv } from './kube-client';

export type IbmCloudConfig = {
  apiKey: string;
  region: string;
  resourceGroup: string;
};

/** Read IBM Cloud config from environment variables. */
export const getIbmCloudConfig = (): IbmCloudConfig => ({
  apiKey: process.env.IC_KEY || process.env.IC_API_KEY || requireEnv('IC_KEY'),
  region: process.env.IBM_REGION ?? 'eu-de',
  resourceGroup: process.env.IBM_RESOURCE_GROUP ?? 'cnv-ui',
});

/** Create an IAM authenticator from the API key. */
export const createIamAuthenticator = (apiKey?: string): IamAuthenticator =>
  new IamAuthenticator({ apikey: apiKey ?? getIbmCloudConfig().apiKey });

/**
 * Get an IAM bearer token for direct REST API calls.
 * Uses IamTokenManager directly (not the protected tokenManager on IamAuthenticator).
 */
export const getIamBearerToken = async (apiKey?: string): Promise<string> => {
  const key = apiKey ?? getIbmCloudConfig().apiKey;
  const tokenManager = new IamTokenManager({ apikey: key });
  return tokenManager.getToken();
};

/** IBM Cloud Kubernetes Service REST API base URL. */
export const IKS_API_BASE = 'https://containers.cloud.ibm.com';

/** IBM Cloud VPC API base URL (region-specific). */
export const getVpcApiBase = (region: string): string =>
  `https://${region}.iaas.cloud.ibm.com/v1`;
